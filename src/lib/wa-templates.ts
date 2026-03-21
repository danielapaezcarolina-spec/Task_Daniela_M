// Plantillas amigables para Daniela
// Se rotan aleatoriamente para que no se repitan

interface TemplateParams {
  taskTitle: string;
  companyName: string;
  message: string;
}

// --- PRIMER RECORDATORIO ---
const firstReminders = [
  (p: TemplateParams) =>
    `Hola Dani! 🤗\n\n${p.message}\n\n📋 Tarea: ${p.taskTitle}\n🏢 Empresa: ${p.companyName}\n\n¿Ya pudiste hacerla? 🤔\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hey Daniela! 👋\n\nTe recuerdo esto: ${p.message}\n\n📌 ${p.taskTitle} (${p.companyName})\n\n¿Cómo va? ¿Ya la completaste? 😊\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Dani! 💜\n\nPasando por aquí para recordarte:\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Ya está lista? Cuéntame 😄\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hola Daniela! ✨\n\nTienes pendiente esto:\n${p.message}\n\n📌 Tarea: ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Pudiste avanzar? 🙂\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Buenos momentos Dani! 🌟\n\n¿Recuerdas esta tarea?\n${p.message}\n\n📋 ${p.taskTitle} - ${p.companyName}\n\n¿Ya la hiciste? 🤔\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Dani! 🔔\n\nOye, no se te olvide esto:\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\nDime, ¿ya lo hiciste? 😬\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hola amiga! 💫\n\nTe traigo un recordatorio:\n${p.message}\n\n📌 ${p.taskTitle} (${p.companyName})\n\n¿Ya quedó listo eso? 🤞\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Daniela! 🙋‍♀️\n\nAquí tu asistente favorita recordándote:\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Cómo vamos con eso? 😊\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Ey Dani! 👀\n\nMira que tienes esto pendiente eh:\n${p.message}\n\n📌 ${p.taskTitle} - ${p.companyName}\n\n¿Lo pudiste hacer? Cuéntame 🫣\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hola Dani! 🌸\n\nSolo paso a recordarte con cariño:\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Ya está? 😁\nResponde *si* o *no*`,
];

// --- RECORDATORIOS DE SEGUIMIENTO (ya le preguntó antes) ---
const followUpReminders = [
  (p: TemplateParams) =>
    `Dani, soy yo de nuevo 😅\n\n¿Cómo va esto?\n${p.message}\n\n📋 ${p.taskTitle} (${p.companyName})\n\nNo te vayas a atrasar! ⏰\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Daniela! 🔔\n\nSolo chequeo... ¿ya pudiste con esto?\n${p.message}\n\n📌 ${p.taskTitle} - ${p.companyName}\n\nAnda que tú puedes! 💪\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hola otra vez Dani 👀\n\nEsta tarea sigue pendiente:\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿La terminaste ya? 🤞\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Dani! 🕐\n\nPasando de nuevo por aquí...\n${p.message}\n\n📌 ${p.taskTitle} (${p.companyName})\n\nNo quiero que se te pase! 😊\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Hey Daniela! 💫\n\nAún tenemos esto pendiente:\n${p.message}\n\n📋 ${p.taskTitle} - ${p.companyName}\n\nCuéntame, ¿ya estuvo? 🙏\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Soy yo otra vez Dani 🙈\n\nPerdona la insistencia pero es por tu bien:\n${p.message}\n\n📋 ${p.taskTitle} (${p.companyName})\n\n¿Ya? ¿No? 😬\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Dani dale que sí puedes! 💪\n\nEsto sigue esperándote:\n${p.message}\n\n📌 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Ya lo sacaste? 🤔\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Oye Daniela 😤 jajaja mentira 😂\n\nPero sí, esto sigue pendiente:\n${p.message}\n\n📋 ${p.taskTitle} (${p.companyName})\n\n¿Lo hiciste ya? 🫣\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Aquí sigo Dani 🐝\n\nNo me voy hasta que terminemos con:\n${p.message}\n\n📌 ${p.taskTitle} - ${p.companyName}\n\nDime que ya! 🙏\nResponde *si* o *no*`,

  (p: TemplateParams) =>
    `Daniela! 📢\n\nÚltimo aviso jajaja (mentira, vuelvo en 3 min 😂):\n${p.message}\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¿Ya quedó? 🤷‍♀️\nResponde *si* o *no*`,
];

// --- RESPUESTAS CUANDO DICE "SI" ---
const confirmationResponses = [
  (p: TemplateParams) =>
    `Excelente Dani! 🎉\n\nTarea "${p.taskTitle}" marcada como completada ✅\n\n¡Seguimos con todo! 💪`,

  (p: TemplateParams) =>
    `Genial Daniela! ✨\n\n"${p.taskTitle}" completada y tachada del sistema ✅\n\n¡Vas súper bien! 🌟`,

  (p: TemplateParams) =>
    `Perfecto! 🙌\n\n"${p.taskTitle}" lista! ✅\n\nUna menos, ¡tú puedes con todas! 💜`,

  (p: TemplateParams) =>
    `¡Bien hecho Dani! 👏\n\n"${p.taskTitle}" completada ✅\n\nSigue así, vas increíble! 🚀`,

  (p: TemplateParams) =>
    `¡Esa es mi Dani! 💪✅\n\n"${p.taskTitle}" terminada y registrada.\n\n¡A por la siguiente! 🎯`,

  (p: TemplateParams) =>
    `Woooo Daniela! 🥳\n\n"${p.taskTitle}" LISTA ✅\n\nAsí se hace, eres una máquina! 🔥`,

  (p: TemplateParams) =>
    `Yesss! ✅🎊\n\n"${p.taskTitle}" completada!\n\nDani imparable hoy! 💜💪`,

  (p: TemplateParams) =>
    `Dale! "${p.taskTitle}" fuera de la lista! ✅\n\n¡Eso Dani! Vas volando hoy 🛫`,

  (p: TemplateParams) =>
    `Registrado! ✅\n\n"${p.taskTitle}" completada.\n\nQué crack eres Daniela 👑`,

  (p: TemplateParams) =>
    `Hecho y hecho! ✅✅\n\n"${p.taskTitle}" tachada del sistema.\n\nSigamos que vamos bien Dani! 🏃‍♀️💨`,
];

// --- RESPUESTAS CUANDO DICE "NO" ---
const rejectionResponses = [
  (p: TemplateParams) =>
    `Tranquila Dani, no hay prisa 🤗\n\nTe recuerdo en unos minutitos.\n\n📋 ${p.taskTitle}\n🏢 ${p.companyName}\n\n¡Tú puedes! 💪`,

  (p: TemplateParams) =>
    `Entendido Daniela 👍\n\nMe paso de nuevo en un ratito para chequear.\n\n📌 ${p.taskTitle} (${p.companyName})\n\nSin estrés! 😊`,

  (p: TemplateParams) =>
    `Ok Dani, sin problema 🙂\n\nVuelvo a recordarte pronto.\n\n📋 ${p.taskTitle} - ${p.companyName}\n\n¡Ánimo! ✨`,

  (p: TemplateParams) =>
    `Dale Daniela, tómate tu tiempo 💜\n\nTe aviso otra vez en unos minutos.\n\n📌 ${p.taskTitle}\n🏢 ${p.companyName}`,

  (p: TemplateParams) =>
    `No hay rollo Dani 😉\n\nTe vuelvo a escribir en un momentito.\n\n📋 ${p.taskTitle} (${p.companyName})\n\n¡Cuenta conmigo! 🤝`,

  (p: TemplateParams) =>
    `Okis Dani! 😊\n\nYo aquí pendiente, te recuerdo ahorita.\n\n📌 ${p.taskTitle}\n🏢 ${p.companyName}\n\nRelax, lo sacamos! 🙌`,

  (p: TemplateParams) =>
    `Ntp Daniela 🫂\n\nAquí estaré para recordarte.\n\n📋 ${p.taskTitle} (${p.companyName})\n\nPaso en un ratico! 🔔`,

  (p: TemplateParams) =>
    `Va va, sin presión Dani ☺️\n\nTe doy unos minutitos y vuelvo.\n\n📌 ${p.taskTitle}\n🏢 ${p.companyName}\n\nTú tranquila! 💫`,
];

// --- RESUMEN MATUTINO ---
const morningGreetings = [
  `Buenos días Daniela! ☀️\n\nAquí tienes tu resumen del día:`,
  `Hola Dani! 🌅\n\n¿Lista para hoy? Este es tu panorama:`,
  `Buenos días! ✨\n\nEmpezamos el día con todo, aquí van tus tareas:`,
  `Hey Daniela! 🌞\n\nTe cuento cómo viene el día de hoy:`,
  `Buen día Dani! 💜\n\n¿Preparada? Esto es lo que tenemos hoy:`,
  `Hola Dani! ☀️\n\nArrancamos! Mira lo que hay para hoy:`,
  `Buenos días Daniela! 🌻\n\nOtra jornada más, vamos con todo:`,
  `Hey Dani! 🫶\n\nDesayunaste? Porque mira lo que nos espera hoy:`,
];

// --- CUANDO HAY MUCHAS TAREAS ---
const busyDayComments = [
  `\n\nUff Dani, hoy tenemos bastante eh 😮‍💨 Pero dale que sí podemos! 💪`,
  `\n\nBueno Daniela, hoy viene cargadito el día 😅 Pero tú eres una crack! 🔥`,
  `\n\nAy Dani, hoy sí hay trabajo 😩 Pero tranquila, una a una las sacamos! 🙌`,
  `\n\nJajaja Dani hoy no paramos 🏃‍♀️💨 Pero ya sabes, somos equipo! 💜`,
  `\n\nHoy viene pesadito el día 😤 Pero Daniela puede con todo, yo sé! ✨`,
  `\n\nDani... hoy sí nos toca duro 😵 Pero café y pa'lante! ☕💪`,
  `\n\nBueno amiga, hoy hay tela que cortar 😬 Un pasito a la vez! 🐢✨`,
  `\n\nOye Dani hoy tenemos full 😮‍💨 Pero con calma que todo sale! 🌟`,
];

// --- CUANDO HAY POCAS TAREAS ---
const lightDayComments = [
  `\n\nHoy viene tranquilo el día 😌 A disfrutar! ☕`,
  `\n\nPoquitas tareas hoy Dani! 🎉 Día relajado 😊`,
  `\n\nHoy está suave! 💆‍♀️ Aprovecha para adelantar cositas 😉`,
  `\n\nDía light hoy Daniela! ✌️ Qué bien se siente 😄`,
];

// --- CUANDO NO HAY TAREAS ---
const freeDayComments = [
  `\n\nDani! Hoy no hay tareas programadas 🎉🎉\n\nDisfruta tu día! 💜`,
  `\n\nWow Daniela, día libre de tareas! 😍\n\nTe lo mereces! ☕🌸`,
  `\n\nCero tareas hoy Dani! 🙌\n\nRelax total, tú te lo ganaste ✨`,
];

// --- RESUMEN NOCTURNO ---
const eveningGreetings = [
  `Buenas noches Dani! 🌙\n\nAquí va tu resumen del día:`,
  `Hey Daniela! 🌆\n\nVamos a ver cómo nos fue hoy:`,
  `Dani! ✨\n\nCerramos el día, aquí el balance:`,
  `Buenas noches Daniela! 💜\n\nMira cómo quedó todo hoy:`,
  `Hola Dani! 🌙\n\nHora del resumen, veamos:`,
  `Daniela! 🌃\n\nSe acabó el día, mira cómo nos fue:`,
  `Hey Dani! 😴\n\nAntes de descansar, tu resumen:`,
  `Buenas noches! 🌙✨\n\nDani, así quedó el día de hoy:`,
];

// --- RESUMEN NOCTURNO - BUEN DIA ---
const eveningGoodDay = [
  `\n\n¡Excelente día Dani! 🎉 Completaste casi todo!`,
  `\n\nDanielaaaa qué bien te fue hoy! 🙌🔥`,
  `\n\nBravo Daniela! Hoy sí que rendiste 👏💜`,
  `\n\nQué crack eres Dani! Gran día! 👑✨`,
];

// --- RESUMEN NOCTURNO - DIA REGULAR ---
const eveningOkDay = [
  `\n\nNo estuvo mal Dani! Mañana seguimos 😊`,
  `\n\nBuen avance Daniela! Lo que quedó pendiente lo sacamos mañana 💪`,
  `\n\nVamos bien Dani! Descansa que mañana continuamos ☺️`,
];

// --- RESUMEN NOCTURNO - DIA FLOJO ---
const eveningBadDay = [
  `\n\nBueno Dani, no fue nuestro mejor día 😅 Pero mañana arrancamos con todo! 💪`,
  `\n\nTranquila Daniela, hay días así 🫂 Mañana lo compensamos! ✨`,
  `\n\nNo pasa nada Dani! Descansa hoy y mañana con energía nueva 🔋💜`,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getFirstReminderText(params: TemplateParams): string {
  return pickRandom(firstReminders)(params);
}

export function getFollowUpReminderText(params: TemplateParams): string {
  return pickRandom(followUpReminders)(params);
}

export function getConfirmationText(params: TemplateParams): string {
  return pickRandom(confirmationResponses)(params);
}

export function getRejectionText(params: TemplateParams): string {
  return pickRandom(rejectionResponses)(params);
}

export function getMorningGreeting(): string {
  return pickRandom(morningGreetings);
}

export function getMorningComment(taskCount: number): string {
  if (taskCount === 0) return pickRandom(freeDayComments);
  if (taskCount <= 3) return pickRandom(lightDayComments);
  return pickRandom(busyDayComments);
}

export function getEveningGreeting(): string {
  return pickRandom(eveningGreetings);
}

export function getEveningComment(completedPercent: number): string {
  if (completedPercent >= 80) return pickRandom(eveningGoodDay);
  if (completedPercent >= 40) return pickRandom(eveningOkDay);
  return pickRandom(eveningBadDay);
}
