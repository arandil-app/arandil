-- Seed inicial: preguntas de matemáticas básicas
-- Para probar el flujo de práctica end-to-end

-- Álgebra básica
INSERT INTO questions (topic, subtopic, stem, options, correct_index, solution_steps, difficulty, approved, source)
VALUES
  ('algebra', 'linear_equations', 'Resuelve: 2x + 5 = 13', '["x = 2", "x = 3", "x = 4", "x = 5", "x = 6"]', 2, '["Resta 5 en ambos lados: 2x = 8", "Divide ambos lados entre 2: x = 4"]', 0.3, true, 'manual'),
  ('algebra', 'linear_equations', 'Si 3x - 7 = 14, ¿cuánto vale x?', '["x = 5", "x = 6", "x = 7", "x = 8", "x = 9"]', 2, '["Suma 7 en ambos lados: 3x = 21", "Divide ambos lados entre 3: x = 7"]', 0.4, true, 'manual'),
  ('algebra', 'quadratic', '¿Cuál es la solución de x² - 5x + 6 = 0?', '["x = 1 o x = 6", "x = 2 o x = 3", "x = -2 o x = -3", "x = 1 o x = -6", "x = 0 o x = 5"]', 1, '["Factorizar: (x - 2)(x - 3) = 0", "Por tanto: x = 2 o x = 3"]', 0.6, true, 'manual'),

  ('geometry', 'triangles', 'En un triángulo rectángulo, si un cateto mide 3 cm y la hipotenusa 5 cm, ¿cuánto mide el otro cateto?', '["2 cm", "3 cm", "4 cm", "5 cm", "6 cm"]', 2, '["Usa el teorema de Pitágoras: a² + b² = c²", "3² + b² = 5²", "9 + b² = 25", "b² = 16", "b = 4 cm"]', 0.5, true, 'manual'),
  ('geometry', 'areas', '¿Cuál es el área de un círculo con radio 7 cm? (usa π ≈ 3.14)', '["43.96 cm²", "153.86 cm²", "21.98 cm²", "98 cm²", "49 cm²"]', 1, '["Fórmula del área: A = πr²", "A = 3.14 × 7²", "A = 3.14 × 49", "A ≈ 153.86 cm²"]', 0.4, true, 'manual'),

  ('calculus', 'derivatives', '¿Cuál es la derivada de f(x) = x³?', '["2x²", "3x²", "x²", "3x", "x³"]', 1, '["Regla de potencias: d/dx(xⁿ) = n·xⁿ⁻¹", "d/dx(x³) = 3·x³⁻¹ = 3x²"]', 0.5, true, 'manual'),
  ('calculus', 'limits', '¿Cuál es el límite de (x² - 4)/(x - 2) cuando x tiende a 2?', '["0", "2", "4", "∞", "No existe"]', 2, '["Factorizar: (x² - 4) = (x + 2)(x - 2)", "Simplificar: (x + 2)(x - 2)/(x - 2) = x + 2", "Evaluar: lim(x→2) x + 2 = 4"]', 0.7, true, 'manual'),

  ('trigonometry', 'identities', 'Si sen(θ) = 0.6 y θ está en el primer cuadrante, ¿cuánto vale cos(θ)?', '["0.6", "0.8", "0.4", "1.0", "0.5"]', 1, '["Usa identidad: sen²(θ) + cos²(θ) = 1", "(0.6)² + cos²(θ) = 1", "0.36 + cos²(θ) = 1", "cos²(θ) = 0.64", "cos(θ) = 0.8"]', 0.6, true, 'manual'),
  ('trigonometry', 'basic', '¿Cuánto vale tan(45°)?', '["0", "0.5", "1", "√2", "∞"]', 2, '["tan(45°) = sen(45°)/cos(45°)", "tan(45°) = (√2/2)/(√2/2)", "tan(45°) = 1"]', 0.3, true, 'manual'),

  ('statistics', 'mean', 'Calcula la media de: 4, 8, 12, 16, 20', '["10", "12", "14", "16", "8"]', 1, '["Suma todos los valores: 4 + 8 + 12 + 16 + 20 = 60", "Divide entre la cantidad: 60 ÷ 5 = 12"]', 0.3, true, 'manual');
