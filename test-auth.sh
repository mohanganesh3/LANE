#!/bin/bash

# Authentication Testing Script
# Run this to test all auth flows

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🔐  AUTHENTICATION SYSTEM TEST  🔐                 ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test credentials
TEST_EMAIL="mohanganesh.g23@iiits.in"
BASE_URL="http://localhost:3000"

echo "${BLUE}📋 Running Authentication Tests${NC}"
echo ""

# Test 1: Check if server is running
echo "${YELLOW}TEST 1: Server Health Check${NC}"
if curl -s "${BASE_URL}" > /dev/null; then
    echo "${GREEN}✅ Server is running on port 3000${NC}"
else
    echo "${RED}❌ Server is not running. Start with: npm start${NC}"
    exit 1
fi
echo ""

# Test 2: Login Page
echo "${YELLOW}TEST 2: Login Page${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/auth/login")
if [ "$HTTP_CODE" = "200" ]; then
    echo "${GREEN}✅ Login page accessible (HTTP $HTTP_CODE)${NC}"
else
    echo "${RED}❌ Login page error (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 3: Forgot Password Page
echo "${YELLOW}TEST 3: Forgot Password Page${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/auth/forgot-password")
if [ "$HTTP_CODE" = "200" ]; then
    echo "${GREEN}✅ Forgot password page accessible (HTTP $HTTP_CODE)${NC}"
else
    echo "${RED}❌ Forgot password page error (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 4: Forgot Password API
echo "${YELLOW}TEST 4: Forgot Password API${NC}"
echo "Sending password reset request for: ${TEST_EMAIL}"
RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\"}")

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "${GREEN}✅ Password reset request successful${NC}"
    echo "Response: $RESPONSE"
else
    echo "${RED}❌ Password reset request failed${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Database OTP Check
echo "${YELLOW}TEST 5: Database OTP Verification${NC}"
echo "Running database check..."
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lane')
  .then(async () => {
    const user = await User.findOne({ email: '${TEST_EMAIL}' });
    if (user) {
      console.log('${GREEN}✅ User found in database${NC}');
      console.log('   Email Verified:', user.emailVerified);
      console.log('   Phone Verified:', user.phoneVerified);
      if (user.resetPasswordOTP) {
        console.log('   ${BLUE}Current OTP: ' + user.resetPasswordOTP + '${NC}');
        console.log('   OTP Expires:', user.resetPasswordOTPExpires);
      } else {
        console.log('   No active OTP');
      }
    } else {
      console.log('${RED}❌ User not found${NC}');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('${RED}❌ Database error:', err.message, '${NC}');
    process.exit(1);
  });
"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo "${GREEN}✅ TESTING COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "${BLUE}📖 Manual Testing Steps:${NC}"
echo ""
echo "1️⃣  ${YELLOW}Test Login:${NC}"
echo "   • Visit: ${BASE_URL}/auth/login"
echo "   • Email: ${TEST_EMAIL}"
echo "   • Try logging in"
echo ""
echo "2️⃣  ${YELLOW}Test Forgot Password:${NC}"
echo "   • Visit: ${BASE_URL}/auth/forgot-password"
echo "   • Enter: ${TEST_EMAIL}"
echo "   • Click 'Send Reset Code'"
echo "   • Check email for OTP"
echo "   • Should redirect to reset password page"
echo ""
echo "3️⃣  ${YELLOW}Check Browser Console:${NC}"
echo "   • Open Developer Tools (F12)"
echo "   • Look for blue/green/red emoji logs"
echo "   • Should see detailed request/response logs"
echo ""
echo "4️⃣  ${YELLOW}Check Server Logs:${NC}"
echo "   • Look for emoji indicators in terminal"
echo "   • 🔵 = Info, ✅ = Success, ❌ = Error"
echo ""

echo "${BLUE}🔗 Useful URLs:${NC}"
echo "   • Login:     ${BASE_URL}/auth/login"
echo "   • Register:  ${BASE_URL}/auth/register"
echo "   • Forgot:    ${BASE_URL}/auth/forgot-password"
echo "   • Dashboard: ${BASE_URL}/user/dashboard"
echo ""
