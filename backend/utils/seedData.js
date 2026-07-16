import bcrypt from 'bcryptjs';

// Pre-hashed passwords for demo logins (password: password123)
const demoPasswordHash = bcrypt.hashSync('password123', 10);

export const seedMockData = () => {
  global.mockUsers = [];
  global.mockRecords = [];
  global.mockReminders = [];
  global.mockVisits = [];
  global.mockShareLinks = [];
  global.mockAuditLogs = [];
  console.log(`[Seed Data] Seeding disabled. All mock datasets initialized to empty.`);
};
