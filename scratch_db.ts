import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const companies = await prisma.company.findMany();
  console.log('Companies:', companies.map(c => c.name));

  const ars = await prisma.accountReceivable.findMany();
  console.log('AccountReceivables:', ars);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
