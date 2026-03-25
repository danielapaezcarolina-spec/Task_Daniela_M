import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.accountReceivable.deleteMany();
  await prisma.taskObservation.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.task.deleteMany();
  await prisma.company.deleteMany();

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

  // ========== BLOQUE 1: EMPRESAS REALES ==========
  const companiesData = [
    { name: "LOS CEDROS HARDWOOD FLOORING SAS CI", rif: "900337039", phone: "+573146013522", contactName: "ANYELA PEDRAHITA" },
    { name: "JN REALTY PROPERTY MANAGEMENT LLC", rif: "N/A", phone: "+573104884253", contactName: "JUAN DAVID RESTREPO" },
    { name: "ISAEDU FLORIDA LLC", rif: "992184006", phone: "+573104884253", contactName: "JUAN DAVID RESTREPO" },
    { name: "MANPRE SAS", rif: "901363861", phone: "+573185574030", contactName: "ROBERTO FLOREZ" },
    { name: "SERVITECH", rif: "901923623", phone: "+573243001873", contactName: "EDIER DE LA CRUZ" },
    { name: "NERYS PAOLA ROMO GUZMAN", rif: "36688167", phone: "+573014147802", contactName: "PAOLA ROMO" },
    { name: "EDIER ANTONIO DE LA CRUZ AVILA", rif: "1083040891", phone: "+573243001873", contactName: "EDIER DE LA CRUZ" },
    { name: "JOHEIBYS NEVARDO JIMENEZ NIEVES", rif: "5135818", phone: "+573182840343", contactName: "JOHEIBYS JIMENEZ" },
  ];

  const companies = await Promise.all(
    companiesData.map((c) =>
      prisma.company.create({
        data: { ...c, sendDailySummary: true, userId: daniela.id },
      })
    )
  );

  // Map company names to IDs for easy lookup
  const companyMap = new Map(companies.map((c) => [c.name, c.id]));

  // Helper to create tasks for multiple companies
  async function createTasksForCompanies(
    taskData: {
      title: string;
      description: string;
      priority: string;
      recurrence: string;
      dueDate?: string;
      companies: string[];
    }[]
  ) {
    const tasks = [];
    for (const t of taskData) {
      for (const companyName of t.companies) {
        const companyId = companyMap.get(companyName);
        if (!companyId) continue;
        tasks.push(
          prisma.task.create({
            data: {
              title: t.title,
              description: t.description,
              priority: t.priority,
              status: "todo",
              recurrence: t.recurrence,
              dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
              companyId,
              userId: daniela.id,
            },
          })
        );
      }
    }
    return Promise.all(tasks);
  }

  // ========== BLOQUE 2: TAREAS SEMANALES ==========
  const today = new Date();
  // Find next Friday for weekly tasks
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const weeklyDue = nextFriday.toISOString().split("T")[0];

  await createTasksForCompanies([
    { title: "Reporte gastos uraba", description: "Reporte semanal de gastos de Urabá", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Reporte gastos obras y administrativos", description: "Reporte semanal de gastos de obras y administrativos", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Reporte IVA", description: "Reporte semanal de IVA", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Reporte IVA maderdeck", description: "Reporte semanal de IVA Maderdeck", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Revision y conciliacion bancaria", description: "Revisión y conciliación bancaria semanal", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["JN REALTY PROPERTY MANAGEMENT LLC", "ISAEDU FLORIDA LLC"] },
    { title: "Revision facturas", description: "Revisión semanal de facturas", priority: "medium", recurrence: "weekly", dueDate: weeklyDue, companies: ["MANPRE SAS", "SERVITECH"] },
  ]);

  // ========== BLOQUE 3: RETENCIÓN EN LA FUENTE ==========
  await createTasksForCompanies([
    // Los Cedros
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-19", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-23", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-24", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-22", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-21", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-24", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-20", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-21", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-23", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-21", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    // Manpre
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-09", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-12", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-11", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-10", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-08", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-11", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-08", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-08", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-10", companies: ["MANPRE SAS"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-09", companies: ["MANPRE SAS"] },
    // Servitech
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-11", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-14", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-13", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-11", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-12", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-13", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-10", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-13", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-12", companies: ["SERVITECH"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-13", companies: ["SERVITECH"] },
    // Paola Romo
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-17", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-21", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-20", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-18", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-16", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-20", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-16", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-19", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-19", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-17", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    // Edier De La Cruz
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-09", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-12", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-11", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-09", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-08", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-11", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-08", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-08", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-10", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-09", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    // Joheibys
    { title: "Retención en la Fuente - Marzo 2026", description: "Declaración de retención en la fuente del mes de marzo", priority: "high", recurrence: "none", dueDate: "2026-04-18", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Abril 2026", description: "Declaración de retención en la fuente del mes de abril", priority: "high", recurrence: "none", dueDate: "2026-05-22", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Mayo 2026", description: "Declaración de retención en la fuente del mes de mayo", priority: "high", recurrence: "none", dueDate: "2026-06-21", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Junio 2026", description: "Declaración de retención en la fuente del mes de junio", priority: "high", recurrence: "none", dueDate: "2026-07-21", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Julio 2026", description: "Declaración de retención en la fuente del mes de julio", priority: "high", recurrence: "none", dueDate: "2026-08-20", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Agosto 2026", description: "Declaración de retención en la fuente del mes de agosto", priority: "high", recurrence: "none", dueDate: "2026-09-23", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Septiembre 2026", description: "Declaración de retención en la fuente del mes de septiembre", priority: "high", recurrence: "none", dueDate: "2026-10-17", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Octubre 2026", description: "Declaración de retención en la fuente del mes de octubre", priority: "high", recurrence: "none", dueDate: "2026-11-20", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Noviembre 2026", description: "Declaración de retención en la fuente del mes de noviembre", priority: "high", recurrence: "none", dueDate: "2026-12-22", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Retención en la Fuente - Diciembre 2026", description: "Declaración de retención en la fuente del mes de diciembre", priority: "high", recurrence: "none", dueDate: "2027-01-20", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
  ]);

  // ========== BLOQUE 4: IVA BIMESTRAL (Solo Los Cedros) ==========
  await createTasksForCompanies([
    { title: "Declaración IVA Bimestral - Bimestre II (Mar-Abr)", description: "Declaración IVA bimestre II (marzo-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-24", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Declaración IVA Bimestral - Bimestre III (May-Jun)", description: "Declaración IVA bimestre III (mayo-junio)", priority: "high", recurrence: "none", dueDate: "2026-07-21", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Declaración IVA Bimestral - Bimestre IV (Jul-Ago)", description: "Declaración IVA bimestre IV (julio-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-20", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Declaración IVA Bimestral - Bimestre V (Sep-Oct)", description: "Declaración IVA bimestre V (septiembre-octubre)", priority: "high", recurrence: "none", dueDate: "2026-11-23", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
    { title: "Declaración IVA Bimestral - Bimestre VI (Nov-Dic)", description: "Declaración IVA bimestre VI (noviembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-24", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI"] },
  ]);

  // ========== BLOQUE 5: IVA CUATRIMESTRAL ==========
  await createTasksForCompanies([
    // Cuatrimestre I (Ene-Abr)
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre I (Ene-Abr)", description: "Declaración IVA cuatrimestre I (enero-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-11", companies: ["MANPRE SAS"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre I (Ene-Abr)", description: "Declaración IVA cuatrimestre I (enero-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-13", companies: ["SERVITECH"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre I (Ene-Abr)", description: "Declaración IVA cuatrimestre I (enero-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-20", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre I (Ene-Abr)", description: "Declaración IVA cuatrimestre I (enero-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-11", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre I (Ene-Abr)", description: "Declaración IVA cuatrimestre I (enero-abril)", priority: "high", recurrence: "none", dueDate: "2026-05-21", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    // Cuatrimestre II (May-Ago)
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre II (May-Ago)", description: "Declaración IVA cuatrimestre II (mayo-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-08", companies: ["MANPRE SAS"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre II (May-Ago)", description: "Declaración IVA cuatrimestre II (mayo-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-10", companies: ["SERVITECH"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre II (May-Ago)", description: "Declaración IVA cuatrimestre II (mayo-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-16", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre II (May-Ago)", description: "Declaración IVA cuatrimestre II (mayo-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-08", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre II (May-Ago)", description: "Declaración IVA cuatrimestre II (mayo-agosto)", priority: "high", recurrence: "none", dueDate: "2026-09-17", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    // Cuatrimestre III (Sep-Dic)
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre III (Sep-Dic)", description: "Declaración IVA cuatrimestre III (septiembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-12", companies: ["MANPRE SAS"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre III (Sep-Dic)", description: "Declaración IVA cuatrimestre III (septiembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-14", companies: ["SERVITECH"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre III (Sep-Dic)", description: "Declaración IVA cuatrimestre III (septiembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-20", companies: ["NERYS PAOLA ROMO GUZMAN"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre III (Sep-Dic)", description: "Declaración IVA cuatrimestre III (septiembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-12", companies: ["EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Declaración IVA Cuatrimestral - Cuatrimestre III (Sep-Dic)", description: "Declaración IVA cuatrimestre III (septiembre-diciembre)", priority: "high", recurrence: "none", dueDate: "2027-01-21", companies: ["JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
  ]);

  // ========== BLOQUE 6: TAREAS MENSUALES ==========
  await createTasksForCompanies([
    { title: "Conciliacion bancaria", description: "Conciliación bancaria mensual, vence el 30 de cada mes", priority: "medium", recurrence: "monthly", dueDate: "2026-03-30", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI", "JN REALTY PROPERTY MANAGEMENT LLC", "ISAEDU FLORIDA LLC", "MANPRE SAS", "SERVITECH", "NERYS PAOLA ROMO GUZMAN", "EDIER ANTONIO DE LA CRUZ AVILA"] },
    { title: "Revision IVA mensual y facturas", description: "Revisión mensual de IVA y facturas, vence el 30 de cada mes", priority: "medium", recurrence: "monthly", dueDate: "2026-03-30", companies: ["LOS CEDROS HARDWOOD FLOORING SAS CI", "JN REALTY PROPERTY MANAGEMENT LLC", "ISAEDU FLORIDA LLC", "MANPRE SAS", "SERVITECH", "NERYS PAOLA ROMO GUZMAN", "EDIER ANTONIO DE LA CRUZ AVILA", "JOHEIBYS NEVARDO JIMENEZ NIEVES"] },
    { title: "Enviar extracto a contador", description: "Envío mensual de extracto bancario al contador, vence el 30 de cada mes", priority: "medium", recurrence: "monthly", dueDate: "2026-03-30", companies: ["JN REALTY PROPERTY MANAGEMENT LLC", "ISAEDU FLORIDA LLC"] },
    { title: "Estados financieros", description: "Elaboración mensual de estados financieros, vence el 30 de cada mes", priority: "medium", recurrence: "monthly", dueDate: "2026-03-30", companies: ["SERVITECH", "NERYS PAOLA ROMO GUZMAN", "EDIER ANTONIO DE LA CRUZ AVILA"] },
  ]);

  console.log("Seed completed successfully!");
  console.log(`User: ${daniela.name} (${daniela.email})`);
  console.log(`Companies: ${companies.length}`);
  console.log("All real data from Daniela's Excel has been loaded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
