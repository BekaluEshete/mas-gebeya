// Simple test for the authorize function
const { authorize } = require('./middlewares/auth');

// Create a mock request/response
const mockReq = {
  user: { role: 'consultant' }
};

const mockRes = {
  status: (code) => ({
    json: (data) => console.log(`Response ${code}:`, data)
  })
};

const mockNext = () => console.log('Next called - authorization passed');

console.log('Testing authorize function...');

// Test consultant role
console.log('\n1. Testing consultant role authorization:');
const consultantAuth = authorize('consultant');
consultantAuth(mockReq, mockRes, mockNext);

// Test admin role (should fail)
console.log('\n2. Testing admin role authorization (should fail):');
mockReq.user.role = 'consultant';
const adminAuth = authorize('admin');
adminAuth(mockReq, mockRes, mockNext);

// Test multiple roles
console.log('\n3. Testing multiple role authorization:');
const multiRoleAuth = authorize('consultant', 'admin');
multiRoleAuth(mockReq, mockRes, mockNext);

console.log('\nTest completed!');