import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const jsonPath = resolve('output', 'admin-credentials.json');
const mdPath = resolve('output', 'admin-login-messages.md');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

let md = '# MAST Admin Login Messages\n\n';

function formatMessage(title: string, admin: any) {
  return `### ${admin.name || title}\n\n\`\`\`text\nJay Swaminarayan.\nMAST Assessment admin login details:\nAdmin URL: ${data.adminUrl}\nID: ${admin.email}\nPassword: ${admin.password}\nAccess: ${title}\nPlease keep this ID/password private and share only with the responsible admin.\n\`\`\`\n\n`;
}

md += '## Main Admin\n\n';
md += formatMessage('All zones and centers', data.mainAdmin);

md += '## Zone Admins\n\n';
for (const admin of data.zoneAdmins) {
  md += formatMessage(`${admin.zone} zone`, admin);
}

md += '## Center Admins\n\n';
for (const admin of data.centerAdmins) {
  md += formatMessage(`${admin.center} center only`, admin);
}

writeFileSync(mdPath, md, 'utf8');
console.log('Markdown updated.');
