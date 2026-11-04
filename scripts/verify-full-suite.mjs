import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function fetchReq(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    redirect: options.redirect || 'manual',
  });
  return res;
}

async function runTests() {
  console.log('--- STARTING HECA COMPREHENSIVE VERIFICATION SUITE ---\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Public Pages Status Check
    for (const page of ['/', '/about', '/nominate', '/rsvp', '/blog', '/gallery']) {
      const res = await fetchReq(page);
      assert(res.status === 200, `Public page ${page} returns 200 OK`);
    }

    // 2. Main Navbar Check: Ensure Admin link is removed
    const homeHtml = await (await fetchReq('/')).text();
    const hasAdminInNav = homeHtml.includes('href="/admin"') && homeHtml.includes('Admin / Staff');
    assert(!hasAdminInNav, 'Main navigation does NOT show [Admin / Staff] link to outside users');

    // 3. Admin Login Page Check
    const loginHtml = await (await fetchReq('/admin/login')).text();
    assert(loginHtml.includes('Staff &amp; Admin Sign In') || loginHtml.includes('Sign In') || loginHtml.includes('admin@heca.ng'), 'Admin login page renders correctly');
    const hasAutoFillCard = loginHtml.includes('Administrator AccountAdmin User') || loginHtml.includes('Auto-fill Credentials');
    assert(!hasAutoFillCard, 'Auto-fill administrator credentials card is REMOVED from login page');
    assert(loginHtml.includes('Forgot your password?') || loginHtml.includes('Reset with phone number') || loginHtml.includes('registered phone number'), 'Forgot password reset option is present on login page');

    // 4. Server-Side Protection (Middleware) Check: Unauthenticated access MUST redirect to /admin/login
    for (const protectedPath of ['/admin', '/admin/blog', '/admin/nominations', '/admin/staff', '/admin/gallery', '/admin/password']) {
      const res = await fetchReq(protectedPath, { redirect: 'manual' });
      const isRedirect = res.status === 307 || res.status === 308;
      const location = res.headers.get('location') || '';
      assert(isRedirect && location.includes('/admin/login'), `Unauthenticated access to ${protectedPath} redirects to /admin/login (status ${res.status})`);
    }

    // 5. Admin Authentication via /api/auth/login
    const loginRes = await fetchReq('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@heca.ng', password: 'Heca123!!!' }),
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
    const loginData = await loginRes.json();
    assert(loginData.success === true, 'Login succeeds for administrator (admin@heca.ng)');
    const token = loginData.token;
    assert(Boolean(token), 'JWT token returned on login');

    // Extract set-cookie for token cookie
    const setCookie = loginRes.headers.get('set-cookie') || '';
    assert(setCookie.includes('heca_token=') || setCookie.includes('token='), 'Cookie for token is set on login response');
    const tokenCookieHeader = `heca_token=${token}`;

    // 6. Authenticated Access to Admin Pages using Token Cookie
    for (const protectedPath of [
      '/admin',
      '/admin/blog',
      '/admin/blog/create',
      '/admin/nominations',
      '/admin/nominations/create',
      '/admin/staff',
      '/admin/gallery',
      '/admin/password',
    ]) {
      const res = await fetchReq(protectedPath, {
        headers: { Cookie: tokenCookieHeader },
        redirect: 'manual',
      });
      assert(res.status === 200, `Authenticated access to ${protectedPath} using token cookie returns 200 OK`);
    }

    // 7. Blog CRUD Life-cycle
    // Create
    const createPostRes = await fetchReq('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: tokenCookieHeader,
      },
      body: JSON.stringify({
        title: 'Automated Test Article - HECA 2027',
        author: 'Verification Suite',
        date: '2026-11-04',
        excerpt: 'Verification excerpt for automated testing.',
        body: 'Full body content for verification testing of the blog edit and delete lifecycle.',
        coverId: null,
      }),
    });
    assert(createPostRes.status === 201 || createPostRes.status === 200, 'POST /api/posts creates post successfully');
    const createdPost = await createPostRes.json();
    const postId = createdPost.id;
    assert(Boolean(postId), `Created post assigned ID: ${postId}`);

    // Read without incrementing
    const getPostRes = await fetchReq(`/api/posts/${postId}?noIncrement=true`);
    const fetchedPost = await getPostRes.json();
    assert(fetchedPost.title === 'Automated Test Article - HECA 2027', 'GET /api/posts/[id] retrieves created post');

    // Edit (PUT)
    const updatePostRes = await fetchReq(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: tokenCookieHeader,
      },
      body: JSON.stringify({
        title: 'Updated Test Article - HECA 2027 (Edited)',
        author: 'Verification Suite Edited',
        date: '2026-11-04',
        excerpt: 'Updated excerpt content.',
        body: 'Updated body content.',
      }),
    });
    assert(updatePostRes.status === 200, 'PUT /api/posts/[id] updates post');
    const updateData = await updatePostRes.json();
    assert(updateData.success === true, 'Update post API reports success');

    // Delete
    const deletePostRes = await fetchReq(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: tokenCookieHeader,
      },
    });
    assert(deletePostRes.status === 200, 'DELETE /api/posts/[id] deletes post');

    // Verify deletion
    const verifyDelPost = await fetchReq(`/api/posts/${postId}`);
    assert(verifyDelPost.status === 404, 'Post ID is 404 Not Found after deletion');

    // 8. Nominations CRUD Life-cycle
    // Create
    const createNomRes = await fetchReq('/api/nominations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Cookie: tokenCookieHeader,
      },
      body: JSON.stringify({
        nomineeName: 'Test Nominee Candidate',
        category: 'African Woman of the Year',
        organisation: 'Test Pan-African Union',
        nomineeEmail: 'nominee.test@example.org',
        nomineePhone: '+234 800 111 2222',
        biography: 'Distinguished candidate biography.',
        achievements: 'Notable milestone achievements in education and health.',
        impact: 'Measurable impact across 10 countries.',
        reasons: 'Exemplary leadership and community advocacy.',
        supporting: 'https://example.org/profile',
        nominatorName: 'Test Nominator',
        nominatorEmail: 'nominator.test@example.org',
        nominatorPhone: '+234 800 333 4444',
      }),
    });
    assert(createNomRes.status === 201 || createNomRes.status === 200, 'POST /api/nominations creates nomination');
    const nomData = await createNomRes.json();
    const nomId = nomData.nomination?.id;
    assert(Boolean(nomId), `Nomination assigned ID: ${nomId}`);

    // Read
    const getNomRes = await fetchReq(`/api/nominations/${nomId}`, {
      headers: { Cookie: tokenCookieHeader },
    });
    assert(getNomRes.status === 200, 'GET /api/nominations/[id] retrieves nomination');

    // Edit (PUT)
    const updateNomRes = await fetchReq(`/api/nominations/${nomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: tokenCookieHeader,
      },
      body: JSON.stringify({
        nomineeName: 'Test Nominee Candidate (Updated)',
        category: 'African Woman of the Year',
        status: 'Approved',
        notes: 'Vetted by jury. Recommended for finals.',
      }),
    });
    assert(updateNomRes.status === 200, 'PUT /api/nominations/[id] updates nomination status and review notes');

    // Delete
    const deleteNomRes = await fetchReq(`/api/nominations/${nomId}`, {
      method: 'DELETE',
      headers: { Cookie: tokenCookieHeader },
    });
    assert(deleteNomRes.status === 200, 'DELETE /api/nominations/[id] deletes nomination');

    // 9. Gallery Photographs & Database Bytes Delivery
    const galleryRes = await fetchReq('/api/gallery');
    assert(galleryRes.status === 200, 'GET /api/gallery returns 200 OK');
    const galleryImages = await galleryRes.json();
    assert(Array.isArray(galleryImages) && galleryImages.length >= 50, `Gallery contains all ${galleryImages.length} photographs`);

    // Verify binary byte delivery from PostgreSQL
    const mediaRes = await fetchReq('/api/media?id=51');
    assert(mediaRes.status === 200, 'GET /api/media?id=51 serves raw binary bytes from PostgreSQL');
    const contentType = mediaRes.headers.get('content-type') || '';
    assert(contentType.startsWith('image/'), `Delivered media has image Content-Type (${contentType})`);
    const imgBuffer = await mediaRes.arrayBuffer();
    assert(imgBuffer.byteLength > 10000, `High-res image served directly from database bytes (${imgBuffer.byteLength} bytes)`);

    console.log(`\n========================================`);
    console.log(`SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test suite:', err);
    process.exit(1);
  }
}

runTests();
