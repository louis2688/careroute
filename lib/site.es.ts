import { site } from "./site";

// Spanish copy. Same shape as lib/site.ts so pages can swap one for the other.
export const siteEs: typeof site = {
  ...site,
  hours: "Despacho abierto de 6:00 a. m. a 8:00 p. m., los siete días de la semana",
  description:
    "CareRoute lleva a pacientes a sus citas médicas y de regreso cuando no hace falta una ambulancia. Contamos con sedanes, furgonetas para silla de ruedas y vehículos con camilla, y cada conductor está capacitado para acompañar al pasajero desde su puerta hasta el mostrador de registro.",
  about: [
    "CareRoute empezó en 2024 con dos furgonetas para silla de ruedas y una despachadora que contestaba cada llamada ella misma. Hoy operamos una flota mixta de sedanes, furgonetas con elevador y vehículos con camilla, y seguimos contestando el teléfono de la misma manera.",
    "La mayoría de nuestros pasajeros viajan con nosotros cada semana: diálisis tres veces por semana, fisioterapia después de una cirugía, visitas de oncología o una cita fija con un especialista al otro lado de la ciudad. Hospitales, centros de diálisis, residencias, aseguradoras e intermediarios de transporte reservan con nosotros en nombre de sus pacientes. Las familias reservan directamente.",
  ],
  mission: "Llevar a cada pasajero a su cita con seguridad, a tiempo y con la ayuda que necesita en ambos extremos del viaje.",
  vision: "Una comunidad donde nadie falta a diálisis, a terapia ni a una cita de seguimiento por no tener cómo llegar.",
  serves: [
    "Pacientes y familias",
    "Hospitales y clínicas",
    "Centros de diálisis",
    "Residencias y viviendas asistidas",
    "Aseguradoras e intermediarios de transporte",
    "Gestores de casos y trabajadores sociales",
  ],
  included: [
    { icon: "clock", title: "Llegada anticipada", text: "Los conductores llegan de 10 a 15 minutos antes de la hora de recogida y esperan hasta 10 minutos." },
    { icon: "accessibility", title: "Ayuda de puerta a puerta", text: "Asistencia desde su puerta hasta el vehículo, y del vehículo al mostrador de registro." },
    { icon: "shield-check", title: "Sujeción durante el viaje", text: "Cinturón de seguridad para todos y anclajes de cuatro puntos para cada silla de ruedas." },
    { icon: "phone", title: "Una persona al teléfono", text: "Despacho confirma cada solicitud y puede comunicarse con su conductor durante el viaje." },
  ],
  proof: [
    { icon: "shield-check", title: "Con licencia y seguro", text: "Cobertura comercial de auto y responsabilidad civil en cada vehículo." },
    { icon: "accessibility", title: "Flota conforme a la ADA", text: "Furgonetas con elevador y anclajes de cuatro puntos para sillas de ruedas." },
    { icon: "user", title: "Conductores capacitados", text: "Verificación de antecedentes, RCP y primeros auxilios, manejo defensivo y asistencia al pasajero." },
    { icon: "phone", title: "Despacho en vivo", text: "Abierto los siete días de la semana y atendido por personas, no por un menú telefónico." },
  ],
  steps: [
    { title: "Solicite un viaje", text: "Use el formulario de reserva o llame a despacho. Díganos adónde va, cuándo y qué ayuda necesita." },
    { title: "Confirmamos", text: "Despacho verifica la disponibilidad de vehículos y le llama o escribe dentro de una hora hábil con la ventana de recogida y el precio." },
    { title: "Su conductor llega antes", text: "Los conductores llegan de 10 a 15 minutos antes de la recogida, le ayudan a subir al vehículo y le acompañan hasta el mostrador de registro." },
  ],
  services: [
    { slug: "ambulatory", icon: "user", name: "Transporte ambulatorio", summary: "Viajes de puerta a puerta para pasajeros que pueden caminar con poca o ninguna ayuda.", details: ["Sedán o minivan con un conductor que le acompaña hasta la entrada", "Espacio para bastón, andador o silla de ruedas plegable", "De acera a acera o de puerta a puerta, usted elige"] },
    { slug: "wheelchair", icon: "accessibility", name: "Transporte en silla de ruedas", summary: "Furgonetas con elevador para pasajeros que viajan en su propia silla de ruedas o necesitan una para el viaje.", details: ["Elevador hidráulico o rampa, anclajes de cuatro puntos, cinturón de cadera y hombro", "Silla de ruedas prestada a pedido", "Conductores capacitados para ayudar en escaleras, rampas y entradas estrechas"] },
    { slug: "stretcher", icon: "bed-single", name: "Transporte en camilla", summary: "Transporte no urgente para pasajeros que deben permanecer acostados.", details: ["Dos asistentes capacitados en cada viaje en camilla", "Recogidas en hospital, rehabilitación y domicilio", "No sustituye a una ambulancia. Llame a emergencias si hay una necesidad médica urgente."] },
    { slug: "dialysis", icon: "refresh-cw", name: "Transporte para diálisis", summary: "Viajes recurrentes organizados según su horario de sillón, tres veces por semana o según lo indicado.", details: ["Órdenes permanentes: reserva una vez, no antes de cada sesión", "Recogida de regreso programada al final de su tratamiento", "El mismo conductor siempre que el horario lo permita"] },
    { slug: "appointments", icon: "stethoscope", name: "Citas médicas", summary: "Consultas médicas, fisioterapia, infusiones, imágenes, laboratorio y dentista.", details: ["Solo ida o ida y vuelta, con opción de esperar y regresar", "Un acompañante viaja gratis", "Llamada de recordatorio el día anterior"] },
    { slug: "discharge", icon: "hospital", name: "Alta hospitalaria", summary: "Un viaje a casa o a un centro de cuidados cuando el hospital le da el alta.", details: ["Recogida el mismo día cuando hay un vehículo disponible", "Coordinamos directamente con el gestor de casos o la estación de enfermería", "Ayuda con pertenencias, medicamentos y equipo"] },
    { slug: "long-distance", icon: "route", name: "Larga distancia y entre centros", summary: "Traslados entre ciudades, hospitales, centros de rehabilitación y residencias.", details: ["Tarifa fija por viaje, acordada antes de confirmar", "Paradas de descanso planificadas en viajes largos", "Vehículos para silla de ruedas y camilla disponibles"] },
    { slug: "medical-travel", icon: "plane", name: "Viajes médicos y asistencia en aeropuerto", summary: "Traslados para pacientes que viajan a la región o salen de ella para recibir tratamiento.", details: ["Recibimiento en llegadas, con ayuda para el equipaje", "Aeropuerto, hotel y clínica en una sola reserva", "Horarios coordinados con su equipo de atención"] },
  ],
  termsEffective: "1 de septiembre de 2026",
  terms: [
    { title: "Aceptación de estas condiciones", body: ["Estas condiciones se aplican a cada viaje reservado con CareRoute, ya sea por teléfono, en línea o a través de un centro o intermediario. Al reservar un viaje, usted las acepta en su nombre y en el de cualquier pasajero para quien reserve."] },
    { title: "Alcance del servicio", body: ["CareRoute presta únicamente transporte médico no urgente. Nuestros vehículos no son ambulancias y nuestros conductores no brindan atención médica más allá de primeros auxilios básicos. Si un pasajero tiene una emergencia médica antes o durante un viaje, llame al número de emergencias local.", "No transportamos pasajeros que necesiten oxígeno que no hayamos coordinado con anticipación, bombas intravenosas ni monitoreo cardíaco durante el viaje."] },
    { title: "Reservas y programación", body: ["Reserve con al menos 24 horas de anticipación. Las solicitudes para el mismo día se aceptan cuando hay un vehículo disponible y pueden tener un recargo.", "Una reserva queda confirmada solo cuando despacho envía una confirmación por teléfono, mensaje de texto o correo electrónico. La ventana de recogida va de 15 minutos antes a 15 minutos después de la hora confirmada."] },
    { title: "Cancelaciones y ausencias", body: ["Cancele sin costo hasta dos horas antes de la recogida programada. Las cancelaciones tardías y las ausencias se cobran a la tarifa base.", "Los conductores esperan 10 minutos en el punto de recogida. Después de eso, el viaje se marca como ausencia salvo que usted haya contactado a despacho. Tres ausencias en 30 días pueden implicar un depósito para futuras reservas."] },
    { title: "Responsabilidades del pasajero", body: ["Proporcione direcciones exactas de recogida y destino, horas de cita e información sobre movilidad. Esté listo en el punto de recogida al inicio de su ventana. Lleve su equipo de movilidad en buen estado de funcionamiento.", "Avísenos al reservar si necesita un acompañante, una silla de ruedas prestada o más tiempo para prepararse. Solo podemos planificar lo que conocemos."] },
    { title: "Acompañantes y menores", body: ["Un acompañante puede viajar gratis con cada pasajero. Los acompañantes adicionales deben aprobarse al reservar y pueden tener costo.", "Los pasajeros menores de 18 años deben ir acompañados por un padre, tutor o cuidador autorizado, salvo que el centro que refiere lo haya acordado por escrito."] },
    { title: "Seguridad y conducta", body: ["El cinturón de seguridad y los anclajes de la silla de ruedas son obligatorios durante todo el viaje. No se permite fumar, vapear, beber alcohol ni comer alimentos abiertos en los vehículos. Los animales de servicio son bienvenidos. Otras mascotas requieren aprobación previa.", "Los conductores pueden terminar un viaje si un pasajero o acompañante amenaza su seguridad o la de otros. Los viajes terminados por este motivo se cobran completos."] },
    { title: "Pago y seguro", body: ["Los viajes de pago privado se cotizan antes de confirmar y se pagan al reservar o al momento de la recogida. Aceptamos las principales tarjetas y órdenes de compra de centros.", "En viajes financiados por seguros, Medicaid, Medicare Advantage o intermediarios, el pasajero o el centro que refiere es responsable de obtener la autorización antes del viaje y de cualquier copago o cargo que el pagador no apruebe. Las cuentas de centros se facturan mensualmente bajo un acuerdo aparte."] },
    { title: "Retrasos y responsabilidad", body: ["Planificamos según el tráfico y el clima, pero no somos responsables de citas perdidas por causas fuera de nuestro control, como cierres de vías, clima severo o que un centro dé el alta a un pasajero con retraso.", "Informe los objetos perdidos a despacho dentro de las 48 horas. Guardamos los objetos encontrados durante 30 días."] },
    { title: "Privacidad e información de salud", body: ["Recopilamos solo la información necesaria para completar su viaje y facturarlo. La información de salud se comparte únicamente con el centro, el pagador o el cuidador involucrado en el viaje, y solo según lo permita la ley de privacidad aplicable.", "Los registros de reservas se conservan el tiempo que exijan las normas de facturación y regulatorias, y luego se eliminan. Contacte a despacho para solicitar una copia de los registros que tenemos sobre usted."] },
    { title: "Cambios a estas condiciones", body: ["Podemos actualizar estas condiciones de vez en cuando. La fecha al inicio de esta página indica la versión vigente. Usar el servicio después de un cambio significa que acepta las condiciones actualizadas."] },
  ],
};
