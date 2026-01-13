# Comparativa teams vs torneos F

## Fuentes y alcance
Este documento compara nuestro **RegF Team 05** contra 10 arquetipos/equipos **representativos** de lo que más se jugó en **VGC 2024 Regulation F**.

**Fuentes usadas (accesibles desde el workspace):**
- **Victory Road (calendario 2024)**: lista qué torneos se jugaron en Reg F (Portland, Charlotte, Liverpool, Dortmund, Utrecht, Vancouver, Orlando, EUIC, etc.).
  - https://victoryroad.pro/2024-season/
- **Limitless VGC (uso por formato, Reg F)**: ranking de Pokémon más usados en equipos registrados para **VGC24 Regulation F**.
  - https://limitlessvgc.com/pokemon/?format=vgc24-regulation-f

**Nota importante (limitación técnica):**
- No pude extraer de forma consistente las páginas con **resultados + equipos exactos por evento** desde Victory Road (rate-limit HTTP 429) ni enumerar top cuts completos desde eventos en Limitless desde aquí.
- Para no inventar datos, lo que sigue es una comparación contra **10 arquetipos de “mejores equipos”** (top/meta) construidos **a partir de núcleos y picks más frecuentes** del formato Reg F, y alineados con los equipos que normalmente aparecen en top cut.

---

## Nuestro equipo (baseline): RegF Team 05 — Aggressive Pivot Offense
**Identidad:** Tailwind + pivoteo + presión inmediata.

**Seis Pokémon:**
- Incineroar (Intimidate, Fake Out, Parting Shot)
- Tornadus (Prankster Tailwind + Taunt)
- Urshifu-R (Mystic Water)
- Flutter Mane (Booster Energy)
- Rillaboom (Assault Vest)
- Landorus-T (Choice Scarf)

**Qué hace bien:**
- Castiga equipos sin buena respuesta a Tailwind (turnos de “snowball” rápidos).
- Tiene 2 Intimidate + pivoteo (Incin + Lando) para ganar posición.
- Presión estable con doble Fake Out + prioridad: Flutter Mane presiona por el lado especial, mientras Urshifu-R / Rillaboom / Lando cierran por el lado físico.

**Puntos de estrés típicos:**
- Hard Trick Room consistente (si Taunt no entra o si hay múltiples setters).
- Redirección + resistencias que amortiguan tus turnos de Tailwind.
- Equipos con buen control de speed alternativo (Icy Wind, Electroweb) o mirrors de Tailwind.

---

## 10 equipos/arquetipos top de Reg F y comparativa

### 1) Mirror “Meta Balance” (pivoteo estándar)
**Representativo:** Incineroar / Amoonguss / Urshifu-R / Flutter Mane / Landorus-T / Tornadus

**Por qué fue top:** son exactamente los Pokémon más repetidos en Reg F (Incineroar, Amoonguss, Flutter Mane, Urshifu-R, Lando, Tornadus aparecen muy alto en Limitless).

**Vs nuestro Team 05**
- **Plan rival:** igualar Tailwind, usar Amoonguss para cortar KOs y ganar turnos con Spore/Rage Powder.
- **Tu plan:** forzar ventaja en los primeros 2 turnos con KO real (no solo chip) y negar Spore con posicionamiento + Taunt.
- **Claves:**
  - Si puedes **Taunt** a Amoonguss o al Tornadus rival (dependiendo lead), reduces muchísimo su “tempo”.
  - Prioriza **Knock Off** temprano para quitar Safety Goggles/berries del soporte rival.


### 2) Rain Balance (Pelipper + Archaludon)
**Representativo (muy común):** Pelipper / Archaludon / Ogerpon-Wellspring / Raging Bolt / Incineroar / Amoonguss

**Por qué fue top:** Rain y Archaludon fueron un core muy sólido en Reg F (equipo parecido ya existe en el repo como Team 02).

**Vs nuestro Team 05**
- **Amenazas:** Wide Guard (niega Rock Slide / Heat Wave), presión de agua constante, Ogerpon-W.
- **Tu plan:**
  - Presiona a Pelipper: sin Tailwind y sin lluvia, Archaludon pierde ritmo.
  - **Rillaboom** fuerza Teras defensivas y castiga a Water cores; **Urshifu-R** amenaza KOs incluso con Protect mindgames.
- **Claves:**
  - No dependas de spread (Heat Wave/Rock Slide) si ves Wide Guard.
  - Busca turnos de **Parting Shot** para re-entrar con Chi‑Yu/Flutter a rango de KO.
  - Con Rillaboom, prioriza quitar items con **Knock Off** y mantener Grassy Terrain para sostener intercambios.


### 3) Aurora Veil / Snow Veil Balance
**Representativo:** Ninetales-A / Baxcalibur / Gholdengo / Incineroar / Ogerpon-W / Iron Hands

**Por qué fue top:** Veil cambia por completo los cálculos; Bax + Gholdengo cierran partidas con presión bajo Veil.

**Vs nuestro Team 05**
- **Amenazas:** Aurora Veil temprano + Gholdengo, prioridad Ice Shard, buena cobertura.
- **Tu plan:**
  - **Taunt** al Ninetales-A si el lead lo permite.
  - Si Veil entra, cambia el objetivo: en vez de “2HKOs”, juega a **posición y KOs garantizados** con doble focus.
- **Claves:**
  - Sin Chi‑Yu, el plan es más de **posición y foco**: fuerza trades con Urshifu-R y usa Tailwind para negar turnos cómodos de setup.
  - Incineroar es clave para frenar Bax/Iron Hands y reposicionar.


### 4) Sunroom (Sun + Trick Room)
**Representativo:** Torkoal / Hatterene / Farigiraf / Amoonguss / Iron Hands / (Roaring Moon u otro modo rápido)

**Por qué fue top:** doble modo (TR + Tailwind/fast mode) y mucho control de prioridad con Farigiraf.

**Vs nuestro Team 05**
- **Amenazas:** TR garantizado (doble setter), Armor Tail niega Aqua Jet, Torkoal bajo TR.
- **Tu plan:**
  - Forzar que TR sea “caro”: Taunt + presión + trades.
  - Guardar Protects para gastar turnos de TR.
- **Claves:**
  - Si el rival tiene Farigiraf, considera que tu endgame de prioridad pierde valor.
  - En muchos casos conviene **gastar Tailwind** defensivamente: no para outspeed, sino para recuperar board tras TR.


### 5) Chien-Pao + Dragonite (ofensiva de prioridad)
**Representativo:** Chien-Pao / Dragonite / Incineroar / Rillaboom / Tornadus / Flutter Mane

**Por qué fue top:** presión inmediata con Sword of Ruin + ESpeed + control con Fake Out.

**Vs nuestro Team 05**
- **Amenazas:** KOs rápidos sin necesitar Tailwind, trades favorables.
- **Tu plan:**
  - Incineroar con **Tera Ghost** es excelente (niega Fake Out y ayuda vs Fighting).
  - Intimidate + Parting Shot reduce mucho el daño físico.
- **Claves:**
  - No regales a Chien‑Pao turnos gratis: si queda en campo, tu equipo cae en rango.
  - Flutter Mane Booster suele ser tu mejor check ofensivo si el rival no tera defensivamente.


### 6) Gholdengo Balance (Good as Gold)
**Representativo:** Gholdengo / Incineroar / Rillaboom / Tornadus / Urshifu-R / Landorus-T

**Por qué fue top:** Gholdengo castiga status y ciertos controles; balance muy estable.

**Vs nuestro Team 05**
- **Amenazas:** Make It Rain bajo Tailwind/posicionamiento, buena resistencia a “trucos”.
- **Tu plan:**
  - Forzar KOs con amenazas duales: Flutter Mane + Urshifu-R presionan muchísimo a Gholdengo si lo obligas a jugar sin setup.
  - Evita depender de reducciones de stats sobre Gholdengo; en cambio, gana por daño/posición.


### 7) Tapu Fini + Raging Bolt “bulky offense”
**Representativo:** Tapu Fini / Raging Bolt / Incineroar / Rillaboom / Landorus-T / Tornadus

**Por qué fue top:** núcleo bulky con buen sustain/mitigación y matchups sólidos.

**Vs nuestro Team 05**
- **Amenazas:** Fini reduce presión de status, Bolt aguanta y devuelve presión; Rillaboom castiga Waters.
- **Tu plan:**
  - Aquí es donde el cambio a **Rillaboom** más se nota: fuerza a Tapu Fini a jugar defensivo y te da cierre con Grassy Glide.
  - Tu “ventana” sigue siendo el early, pero ahora puedes jugar partidas más largas sin depender de un nuke especial.


### 8) Tapu Koko + Garchomp offense
**Representativo:** Tapu Koko / Garchomp / Tornadus / Incineroar / Flutter Mane / Landorus-T

**Por qué fue top:** velocidad natural alta, buena cobertura y presión inmediata.

**Vs nuestro Team 05**
- **Amenazas:** control de speed alternativo, daño mixto, presión sobre Incineroar.
- **Tu plan:**
  - Tailwind temprano te pone por encima incluso de Koko.
  - Landorus Scarf ayuda a limpiar cuando ya forzaste Teras.


### 9) Porygon2 Trick Room balance
**Representativo:** Porygon2 / Amoonguss / Incineroar / Kingambit / Ursaluna / Flutter Mane

**Por qué fue top:** TR consistente + piezas que ganan partidas largas.

**Vs nuestro Team 05**
- **Amenazas:** TR repetible + Rage Powder/Spore, y atacantes que no dependen de outspeed.
- **Tu plan:**
  - Taunt en el setter correcto (P2 o el soporte) y trades rápidos.
  - Si TR entra: Protect + pivoteo para minimizar pérdidas.


### 10) “Fighting pressure” con Iron Hands
**Representativo:** Iron Hands / Incineroar / Amoonguss / Flutter Mane / Landorus-T / Tornadus

**Por qué fue top:** Iron Hands fue top 10 en Reg F (Limitless) por su presión + bulk.

**Vs nuestro Team 05**
- **Amenazas:** Fake Out wars, sustain con Drain Punch, presión constante.
- **Tu plan:**
  - Flutter Mane + Chi‑Yu castigan mucho a Hands si no tera defensivo.
  - Intimidate + Parting Shot le bajan muchísimo el valor.

---

## Conclusiones rápidas (qué tan “meta” es el Team 05)
- El Team 05 está **muy alineado** con lo que más se usaba en Reg F: casi todos tus slots están en el top de uso por formato.
- Tu mayor punto a trabajar es **consistencia contra Trick Room/redirección**.

## Ajustes opcionales (sin romper Item Clause)
Si quieres afinar el Team 05 sin cambiar la identidad:
- Tornadus: considerar **Icy Wind** (por Taunt o Protect) si ves muchos mirrors de Tailwind o necesitas speed control cuando no puedes poner Tailwind.
- Incineroar: considerar **Will-O-Wisp** en lugar de Flare Blitz si tu problema principal son físicos que ignoran Intimidate por Clear Amulet/Defiant (depende de tu meta local).
- Landorus-T: si extrañas daño al no llevar Earthquake, puedes evaluar **Stomping Tantrum vs Earthquake** según tu tolerancia a golpear al aliado.

---

## Anexos
- Calendario 2024 con eventos Reg F: https://victoryroad.pro/2024-season/
- Uso por formato Reg F (para justificar picks/meta): https://limitlessvgc.com/pokemon/?format=vgc24-regulation-f
