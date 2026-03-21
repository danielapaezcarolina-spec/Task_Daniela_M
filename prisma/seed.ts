import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Daniela
  const daniela = await prisma.user.upsert({
    where: { email: "daniela@taskconta.com" },
    update: {},
    create: {
      name: "Daniela Paez",
      email: "daniela@taskconta.com",
      phone: "+584121234567",
      pin: "1234",
      role: "contador",
    },
  });

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Inversiones ABC C.A.",
        rif: "J-12345678-9",
        phone: "+584141234567",
        contactName: "Carlos Mendez",
        sendDailySummary: true,
        userId: daniela.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Comercial El Faro S.A.",
        rif: "J-98765432-1",
        phone: "+584249876543",
        contactName: "Maria Lopez",
        sendDailySummary: true,
        userId: daniela.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Servicios Delta C.A.",
        rif: "J-45678912-3",
        phone: "+584125556677",
        contactName: "Pedro Ramirez",
        sendDailySummary: false,
        userId: daniela.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Grupo Montana LLC",
        rif: "J-11223344-5",
        phone: "+584167778899",
        contactName: "Ana Torres",
        sendDailySummary: true,
        userId: daniela.id,
      },
    }),
  ]);

  const [abc, faro, delta, montana] = companies;

  // Create tasks
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

  await Promise.all([
    prisma.task.create({
      data: {
        title: "Declaracion de IVA",
        description: "Preparar y presentar declaracion mensual de IVA",
        priority: "high",
        status: "todo",
        recurrence: "monthly",
        dueDate: addDays(today, 2),
        companyId: abc.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Conciliacion bancaria",
        description: "Revisar y conciliar movimientos del mes",
        priority: "medium",
        status: "in_progress",
        recurrence: "monthly",
        dueDate: addDays(today, 3),
        companyId: abc.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Retenciones ISLR",
        description: "Calcular y registrar retenciones de ISLR",
        priority: "high",
        status: "todo",
        recurrence: "monthly",
        dueDate: addDays(today, 1),
        companyId: faro.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Facturacion mensual",
        description: "Emitir facturas pendientes del mes",
        priority: "medium",
        status: "todo",
        recurrence: "monthly",
        dueDate: addDays(today, 4),
        companyId: faro.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Libro de compras",
        description: "Actualizar libro de compras del periodo",
        priority: "low",
        status: "done",
        recurrence: "weekly",
        dueDate: addDays(today, -1),
        completedAt: addDays(today, -1),
        companyId: delta.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Nomina quincenal",
        description: "Procesar nomina de la segunda quincena",
        priority: "high",
        status: "in_progress",
        recurrence: "monthly",
        dueDate: addDays(today, 2),
        companyId: montana.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Balance de comprobacion",
        description: "Generar balance de comprobacion mensual",
        priority: "medium",
        status: "todo",
        recurrence: "monthly",
        dueDate: addDays(today, 5),
        companyId: montana.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Declaracion SENIAT",
        description: "Presentar declaracion ante el SENIAT",
        priority: "high",
        status: "todo",
        recurrence: "monthly",
        dueDate: addDays(today, 1),
        companyId: abc.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Revisar facturas de proveedores",
        description: "Verificar y registrar facturas recibidas",
        priority: "low",
        status: "done",
        recurrence: "daily",
        dueDate: addDays(today, 0),
        completedAt: today,
        companyId: abc.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Cierres de caja diario",
        description: "Cuadrar caja al final de cada dia",
        priority: "medium",
        status: "todo",
        recurrence: "daily",
        dueDate: addDays(today, 0),
        companyId: faro.id,
        userId: daniela.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Revision de inventario",
        description: "Verificar stock semanal",
        priority: "low",
        status: "done",
        recurrence: "weekly",
        dueDate: addDays(today, -2),
        completedAt: addDays(today, -2),
        companyId: montana.id,
        userId: daniela.id,
      },
    }),
  ]);

  // Create accounts receivable
  await Promise.all([
    prisma.accountReceivable.create({
      data: {
        client: "Distribuidora Norte",
        concept: "Servicios contables - mes actual",
        amount: 500,
        currency: "USD",
        issueDate: addDays(today, -20),
        dueDate: addDays(today, 2),
        status: "pending",
        amountPaid: 0,
        companyId: abc.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        client: "Farmacia Central",
        concept: "Declaracion ISLR anual",
        amount: 350,
        currency: "USD",
        issueDate: addDays(today, -45),
        dueDate: addDays(today, -15),
        status: "overdue",
        amountPaid: 0,
        companyId: abc.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        client: "Inversiones ABC C.A.",
        concept: "Auditoria trimestral Q1",
        amount: 1200,
        currency: "USD",
        issueDate: addDays(today, -10),
        dueDate: addDays(today, 20),
        status: "partial",
        amountPaid: 600,
        companyId: abc.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        client: "Comercial El Faro S.A.",
        concept: "Nomina mensual",
        amount: 280,
        currency: "USD",
        issueDate: addDays(today, -5),
        dueDate: addDays(today, 7),
        status: "pending",
        amountPaid: 0,
        companyId: faro.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        client: "Tienda Express",
        concept: "Facturacion bimestral",
        amount: 450,
        currency: "USD",
        issueDate: addDays(today, -30),
        dueDate: addDays(today, -5),
        status: "paid",
        amountPaid: 450,
        companyId: faro.id,
      },
    }),
    prisma.accountReceivable.create({
      data: {
        client: "Grupo Montana LLC",
        concept: "Asesoria tributaria",
        amount: 600,
        currency: "USD",
        issueDate: addDays(today, -3),
        dueDate: addDays(today, 25),
        status: "pending",
        amountPaid: 0,
        companyId: montana.id,
      },
    }),
  ]);

  console.log("Seed completed successfully!");
  console.log(`User: ${daniela.name} (${daniela.email})`);
  console.log(`Companies: ${companies.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
