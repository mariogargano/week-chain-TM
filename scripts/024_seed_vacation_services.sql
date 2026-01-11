-- Seed data for vacation services marketplace
-- Demo services for Riviera Maya area

-- First, create a demo service provider (WeekChain Verified Services)
INSERT INTO service_providers (
  id,
  business_name,
  contact_name,
  email,
  phone,
  description,
  verification_status,
  verified_at,
  rating
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  'WeekChain Verified Services',
  'Customer Service',
  'services@weekchain.io',
  '+52 984 123 4567',
  'Official WeekChain verified service providers in Riviera Maya',
  'verified',
  NOW(),
  4.9
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  verification_status = 'verified';

-- Get category IDs
DO $$
DECLARE
  cat_airport UUID;
  cat_chef UUID;
  cat_yacht UUID;
  cat_tours UUID;
  cat_spa UUID;
  cat_car UUID;
  cat_concierge UUID;
  cat_grocery UUID;
BEGIN
  SELECT id INTO cat_airport FROM service_categories WHERE name = 'Airport Transfer';
  SELECT id INTO cat_chef FROM service_categories WHERE name = 'Private Chef';
  SELECT id INTO cat_yacht FROM service_categories WHERE name = 'Yacht Rental';
  SELECT id INTO cat_tours FROM service_categories WHERE name = 'Tours & Activities';
  SELECT id INTO cat_spa FROM service_categories WHERE name = 'Spa & Wellness';
  SELECT id INTO cat_car FROM service_categories WHERE name = 'Car Rental';
  SELECT id INTO cat_concierge FROM service_categories WHERE name = 'Concierge';
  SELECT id INTO cat_grocery FROM service_categories WHERE name = 'Grocery Delivery';

  -- Airport Transfer Services
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Cancun Airport to Playa del Carmen', 'Aeropuerto Cancún a Playa del Carmen', 'Private SUV transfer from Cancun Airport to Playa del Carmen. Includes meet & greet, bottled water, and WiFi.', 'Traslado privado en SUV desde el Aeropuerto de Cancún a Playa del Carmen. Incluye recepción, agua embotellada y WiFi.', cat_airport, '99999999-9999-9999-9999-999999999999', 85, 1700, 'fixed', true, true, 6, 60, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Cancun Airport to Tulum', 'Aeropuerto Cancún a Tulum', 'Comfortable private transfer to Tulum. Professional bilingual driver, air conditioning, and luggage assistance.', 'Traslado privado cómodo a Tulum. Conductor profesional bilingüe, aire acondicionado y asistencia con equipaje.', cat_airport, '99999999-9999-9999-9999-999999999999', 120, 2400, 'fixed', true, true, 6, 90, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Round Trip Airport Transfer', 'Traslado Redondo Aeropuerto', 'Round trip private transfer service. Save 15% booking both ways. Flexible pickup times.', 'Servicio de traslado privado redondo. Ahorra 15% reservando ida y vuelta. Horarios flexibles.', cat_airport, '99999999-9999-9999-9999-999999999999', 180, 3600, 'fixed', true, false, 6, 120, '["/placeholder.svg?height=400&width=600"]');

  -- Private Chef Services
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Mexican Cuisine Experience', 'Experiencia de Cocina Mexicana', 'Authentic Mexican dinner prepared by professional chef. 3-course meal with local ingredients. Chef shops, cooks, and cleans.', 'Cena mexicana auténtica preparada por chef profesional. Comida de 3 tiempos con ingredientes locales. El chef compra, cocina y limpia.', cat_chef, '99999999-9999-9999-9999-999999999999', 150, 3000, 'per_person', true, true, 12, 180, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Seafood BBQ on the Beach', 'BBQ de Mariscos en la Playa', 'Fresh seafood BBQ experience. Lobster, shrimp, fish prepared beachside. Includes setup and cleanup.', 'Experiencia de BBQ de mariscos frescos. Langosta, camarones, pescado preparados en la playa. Incluye montaje y limpieza.', cat_chef, '99999999-9999-9999-9999-999999999999', 180, 3600, 'per_person', true, true, 10, 240, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Private Cooking Class', 'Clase de Cocina Privada', 'Learn to make authentic Mexican dishes. Hands-on experience with professional chef. Take recipes home!', 'Aprende a hacer platillos mexicanos auténticos. Experiencia práctica con chef profesional. ¡Llévate las recetas!', cat_chef, '99999999-9999-9999-9999-999999999999', 120, 2400, 'per_person', true, false, 8, 180, '["/placeholder.svg?height=400&width=600"]');

  -- Yacht Rental Services
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Luxury Yacht - Half Day', 'Yate de Lujo - Medio Día', '45ft luxury yacht with captain and crew. Includes snorkeling gear, drinks, and snacks. Perfect for families.', 'Yate de lujo de 45 pies con capitán y tripulación. Incluye equipo de snorkel, bebidas y snacks. Perfecto para familias.', cat_yacht, '99999999-9999-9999-9999-999999999999', 800, 16000, 'fixed', true, true, 12, 240, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Sunset Catamaran Cruise', 'Crucero en Catamarán al Atardecer', 'Romantic sunset cruise on spacious catamaran. Open bar, appetizers, and live music. Unforgettable experience.', 'Crucero romántico al atardecer en catamarán espacioso. Barra libre, aperitivos y música en vivo. Experiencia inolvidable.', cat_yacht, '99999999-9999-9999-9999-999999999999', 120, 2400, 'per_person', true, true, 30, 180, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Private Fishing Charter', 'Charter de Pesca Privado', 'Deep sea fishing adventure. All equipment included. Captain knows the best spots. Keep your catch!', 'Aventura de pesca en alta mar. Todo el equipo incluido. El capitán conoce los mejores lugares. ¡Quédate con tu pesca!', cat_yacht, '99999999-9999-9999-9999-999999999999', 600, 12000, 'fixed', true, false, 8, 240, '["/placeholder.svg?height=400&width=600"]');

  -- Tours & Activities
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Chichen Itza VIP Tour', 'Tour VIP a Chichén Itzá', 'Private guided tour of Chichen Itza. Early access, expert guide, lunch included. Avoid the crowds!', 'Tour privado guiado a Chichén Itzá. Acceso temprano, guía experto, almuerzo incluido. ¡Evita las multitudes!', cat_tours, '99999999-9999-9999-9999-999999999999', 150, 3000, 'per_person', true, true, 15, 600, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Cenote Adventure Tour', 'Tour de Aventura en Cenotes', 'Visit 3 stunning cenotes. Swimming, snorkeling, and cliff jumping. Includes transportation and lunch.', 'Visita 3 cenotes impresionantes. Natación, snorkel y clavados. Incluye transporte y almuerzo.', cat_tours, '99999999-9999-9999-9999-999999999999', 95, 1900, 'per_person', true, true, 12, 420, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Tulum Ruins & Beach Day', 'Ruinas de Tulum y Día de Playa', 'Explore ancient Tulum ruins with guide, then relax on pristine beach. Perfect combination of culture and relaxation.', 'Explora las antiguas ruinas de Tulum con guía, luego relájate en playa prístina. Combinación perfecta de cultura y relajación.', cat_tours, '99999999-9999-9999-9999-999999999999', 85, 1700, 'per_person', true, true, 20, 360, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Sian Ka''an Biosphere Tour', 'Tour Biosfera Sian Ka''an', 'UNESCO World Heritage site. Boat tour through mangroves, wildlife spotting, and pristine beaches. Eco-friendly adventure.', 'Sitio Patrimonio Mundial UNESCO. Tour en bote por manglares, avistamiento de fauna y playas prístinas. Aventura ecológica.', cat_tours, '99999999-9999-9999-9999-999999999999', 110, 2200, 'per_person', true, false, 10, 480, '["/placeholder.svg?height=400&width=600"]');

  -- Spa & Wellness
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('In-Villa Couples Massage', 'Masaje de Parejas en Villa', 'Relaxing couples massage in your villa. Professional therapists, premium oils, and calming music. Pure bliss.', 'Masaje relajante de parejas en tu villa. Terapeutas profesionales, aceites premium y música relajante. Pura felicidad.', cat_spa, '99999999-9999-9999-9999-999999999999', 180, 3600, 'fixed', true, true, 2, 90, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Mayan Clay Ritual', 'Ritual de Barro Maya', 'Traditional Mayan healing treatment. Clay body wrap, massage, and aromatherapy. Detox and rejuvenate.', 'Tratamiento curativo tradicional maya. Envoltura de barro, masaje y aromaterapia. Desintoxica y rejuvenece.', cat_spa, '99999999-9999-9999-9999-999999999999', 120, 2400, 'per_person', true, false, 4, 120, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Beachside Yoga Session', 'Sesión de Yoga en la Playa', 'Private yoga class on the beach at sunrise or sunset. All levels welcome. Mats and props provided.', 'Clase privada de yoga en la playa al amanecer o atardecer. Todos los niveles bienvenidos. Tapetes y accesorios incluidos.', cat_spa, '99999999-9999-9999-9999-999999999999', 60, 1200, 'per_person', true, true, 10, 60, '["/placeholder.svg?height=400&width=600"]');

  -- Car Rental
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Compact Car - Weekly', 'Auto Compacto - Semanal', 'Fuel-efficient compact car. Perfect for couples. Full insurance included. Free delivery to your property.', 'Auto compacto eficiente en combustible. Perfecto para parejas. Seguro completo incluido. Entrega gratis a tu propiedad.', cat_car, '99999999-9999-9999-9999-999999999999', 280, 5600, 'fixed', true, false, 5, 10080, '["/placeholder.svg?height=400&width=600"]'),
  
  ('SUV - Weekly', 'SUV - Semanal', 'Spacious SUV for families. Air conditioning, GPS, and full insurance. Explore the Riviera Maya in comfort.', 'SUV espacioso para familias. Aire acondicionado, GPS y seguro completo. Explora la Riviera Maya con comodidad.', cat_car, '99999999-9999-9999-9999-999999999999', 450, 9000, 'fixed', true, true, 7, 10080, '["/placeholder.svg?height=400&width=600"]');

  -- Concierge Services
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Personal Concierge - Daily', 'Concierge Personal - Diario', 'Dedicated concierge for your entire stay. Restaurant reservations, activity booking, and local recommendations. 24/7 WhatsApp support.', 'Concierge dedicado para toda tu estancia. Reservas de restaurantes, reserva de actividades y recomendaciones locales. Soporte 24/7 por WhatsApp.', cat_concierge, '99999999-9999-9999-9999-999999999999', 50, 1000, 'per_day', true, true, 1, 1440, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Event Planning Service', 'Servicio de Planificación de Eventos', 'Plan your special celebration. Birthdays, anniversaries, proposals. We handle all details for unforgettable moments.', 'Planifica tu celebración especial. Cumpleaños, aniversarios, propuestas. Manejamos todos los detalles para momentos inolvidables.', cat_concierge, '99999999-9999-9999-9999-999999999999', 200, 4000, 'fixed', true, false, 1, 480, '["/placeholder.svg?height=400&width=600"]');

  -- Grocery Delivery
  INSERT INTO vacation_services (name, name_es, description, description_es, category_id, provider_id, price_usd, price_mxn, pricing_type, verified_by_weekchain, featured, max_capacity, duration_minutes, images) VALUES
  ('Welcome Package - Essentials', 'Paquete de Bienvenida - Esenciales', 'Pre-arrival grocery delivery. Basics: water, coffee, milk, bread, eggs, fruit. Fridge stocked before you arrive!', 'Entrega de despensa pre-llegada. Básicos: agua, café, leche, pan, huevos, fruta. ¡Refrigerador surtido antes de llegar!', cat_grocery, '99999999-9999-9999-9999-999999999999', 80, 1600, 'fixed', true, true, 1, 60, '["/placeholder.svg?height=400&width=600"]'),
  
  ('Premium Grocery Package', 'Paquete Premium de Despensa', 'Full grocery service. Send us your list, we shop and deliver. Includes local specialties and fresh produce.', 'Servicio completo de despensa. Envíanos tu lista, compramos y entregamos. Incluye especialidades locales y productos frescos.', cat_grocery, '99999999-9999-9999-9999-999999999999', 150, 3000, 'fixed', true, false, 1, 120, '["/placeholder.svg?height=400&width=600"]'),
  
  ('BBQ Party Package', 'Paquete Fiesta BBQ', 'Everything for a perfect BBQ. Premium meats, vegetables, charcoal, and condiments. Ready to grill!', 'Todo para un BBQ perfecto. Carnes premium, vegetales, carbón y condimentos. ¡Listo para asar!', cat_grocery, '99999999-9999-9999-9999-999999999999', 120, 2400, 'fixed', true, true, 1, 60, '["/placeholder.svg?height=400&width=600"]');

END $$;
