import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import crypto from 'crypto';

function randomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pwd = '';
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return pwd;
}

const jsonPath = resolve('output', 'admin-credentials.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

data.mainAdmin.password = randomPassword();

for (const admin of data.zoneAdmins) {
  admin.password = randomPassword();
}

for (const admin of data.centerAdmins) {
  admin.password = randomPassword();
}

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated passwords in output/admin-credentials.json');
