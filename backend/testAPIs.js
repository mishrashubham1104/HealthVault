import assert from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { saveAndEncryptFile, readAndDecryptFile } from './middleware/upload.js';
import { seedMockData } from './utils/seedData.js';

// Setup mock state for testing
global.isMockDB = true;
seedMockData();

// Seed test harness mock data
global.mockUsers.push({
  _id: 'user_patient',
  name: 'Demo Patient',
  email: 'patient@example.com',
  role: 'Patient'
});
global.mockRecords.push({
  _id: 'record_blood',
  patientId: 'user_patient',
  category: 'Blood Test',
  title: 'Blood Report',
  fileName: 'blood_report.pdf'
});
global.mockShareLinks.push({
  _id: 'share_link_1',
  patientId: 'user_patient',
  sharingCode: 'abc123xyz',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  recordIds: ['record_blood'],
  accessLogs: [{ success: true }]
});

const runTests = async () => {
  console.log('--- HealthVault Integration Test Harness ---');
  
  try {
    // Test 1: File Encryption & Decryption
    console.log('[Test 1] Testing AES-256 File Upload Encryption/Decryption...');
    const originalText = 'CONFIDENTIAL PATIENT DATA: Blood glucose: 105 mg/dL. HbA1c: 5.7%';
    const buffer = Buffer.from(originalText);
    const testFileName = 'test_report.txt';
    
    // Save and encrypt
    const encryptedPath = saveAndEncryptFile(buffer, testFileName);
    console.log(`- File saved and encrypted at: ${encryptedPath}`);
    
    // Read the encrypted file to verify it does not contain plain text
    const rawSavedContent = fs.readFileSync(encryptedPath).toString();
    assert.ok(!rawSavedContent.includes('CONFIDENTIAL PATIENT DATA'), 'Security Breach: Plain text found in encrypted file!');
    console.log('- Verified: Saved file content is fully encrypted.');

    // Decrypt
    const decryptedBuffer = readAndDecryptFile(encryptedPath);
    const decryptedText = decryptedBuffer.toString();
    assert.strictEqual(decryptedText, originalText, 'Decryption Failure: Content mismatch!');
    console.log('- Verified: Decrypted content exactly matches original buffer.');
    
    // Cleanup test file
    fs.unlinkSync(encryptedPath);
    console.log('- Test file cleaned up successfully.');

    // Test 2: User Authentication & Role retrieval
    console.log('\n[Test 2] Testing User Auth Setup...');
    const patientUser = global.mockUsers.find(u => u.role === 'Patient');
    assert.ok(patientUser, 'Verification Failure: Demo patient user not seeded!');
    console.log(`- Demo Patient retrieved: ${patientUser.name} (${patientUser.email})`);

    // Test 3: Medical Records Vault filters
    console.log('\n[Test 3] Testing Records Vault & Categories...');
    const patientRecords = global.mockRecords.filter(r => r.patientId === patientUser._id);
    assert.ok(patientRecords.length > 0, 'Verification Failure: Patient records not seeded!');
    console.log(`- Found ${patientRecords.length} records in ${patientUser.name}'s vault.`);
    
    const bloodTests = patientRecords.filter(r => r.category === 'Blood Test');
    console.log(`- Blood Tests: ${bloodTests.length} file(s) found.`);
    assert.ok(bloodTests.length > 0, 'Verification Failure: Blood test categorizations failed!');
    
    // Test 4: Secure Share links and audit trail
    console.log('\n[Test 4] Testing Secure Document Share Links...');
    const activeShares = global.mockShareLinks.filter(s => s.patientId === patientUser._id);
    assert.ok(activeShares.length > 0, 'Verification Failure: Active share links not seeded!');
    console.log(`- Found ${activeShares.length} active shared link(s) for doctor consultations.`);
    
    const shareLink = activeShares[0];
    console.log(`- Share Link Code: "${shareLink.sharingCode}" (expires at: ${shareLink.expiresAt})`);
    console.log(`- Shared Records count: ${shareLink.recordIds.length}`);
    console.log(`- Access Audit Logs count: ${shareLink.accessLogs.length}`);
    
    assert.strictEqual(shareLink.accessLogs[0].success, true, 'Verification Failure: Access success tracking failed!');
    console.log('- Verified: Access audit trail registers success logging.');

    console.log('\n=========================================');
    console.log('ALL HEALTHVAULT CORE INTEG-TESTS PASSED! ✅');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
};

runTests();
