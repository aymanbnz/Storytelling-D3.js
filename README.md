# 🎭 Presupuesto Cultural Colombia — Scrollytelling Dashboard

> **Visual Analytics project** — Maestría en Ingeniería de la Información, Universidad de los Andes (ISIS 4822, 2024-20)

An interactive scrollytelling data visualization built with **D3.js** that narrates the budget execution of Colombia's Ministry of Culture (*Ministerio de las Culturas*) for 2024 — from national totals down to per-capita spending at the municipal level.

🔗 **Live demo:** [https://yjtgeneral.z13.web.core.windows.net/proyecto_va/index.html](https://yjtgeneral.z13.web.core.windows.net/proyecto_va/index.html)

---

## 📖 Project Context

The [SINIC](https://www.sinic.gov.co/) (Sistema Nacional de Información Cultural) consolidates and publishes cultural sector data in Colombia. Existing Power BI dashboards lacked the depth and accessibility needed for meaningful civic engagement. This project explores alternative visualization approaches to bridge that gap — making budget data more transparent, engaging, and interpretable for both strategic decision-makers and the general public.

---

## ✨ Features

- **Scrollytelling narrative** — a guided story that unfolds as the user scrolls, following the *Martini Glass* storytelling structure
- **Sankey diagram** — shows how national income flows through the cultural sector down to the Ministry
- **Bubble charts** — visualize total budget, type of expenditure (investment vs. operations), and investment project breakdown
- **Choropleth map** — distribution of budget across all Colombian municipalities
- **Per-capita spending map** — reveals which municipalities receive the most resources relative to their population
- **Interactive exploration mode** — filter by department and investment project to freely explore the data
- Institutional visual identity (SINIC color palette, Nunito Sans typography, dark background)

---

## 📊 Dataset

| Attribute | Type |
|---|---|
| Municipio | Categorical |
| Presupuesto Comprometido / Apropiado / Ejecutado / Obligado | Ordered, Quantitative |
| Tipo de bien | Categorical |
| Dependencia | Categorical |
| Agente cultural | Categorical |
| Población total | Ordered, Quantitative |
| Víctima / Indígena / Afro / Raizal | Categorical |
| Rural / Urbana | Categorical |
| Proyecto | Categorical |
| Subregión PDET / Región / Priorización | Categorical |

- **Source:** Ministry of Culture (provided as Excel export)
- **Size:** 58,582 rows × 19 columns
- **Period:** 2024 fiscal year
- **Quality:** No missing values or duplicates — used as-is

---

## 🧠 Analytical Framework — Tamara Munzner

The visualization was designed following Munzner's *What-Why-How* framework:

### WHAT
Static tabular dataset containing budget, infrastructure, population, and territorial data at the municipal level.

### WHY
| Task | Target | Description |
|---|---|---|
| **Primary** — Analyze / Present | Attribute distribution | Narrative scrolling that communicates budget data as a story |
| **Secondary** — Search / Explore | Trends across all data | Users discover patterns in budget distribution and territorial reach |

### HOW
| Dimension | Elements |
|---|---|
| **Encode** | Express size |
| **Manipulate** | Select |
| **Facet** | Navigate |
| **Reduce** | Filter |
| **Marks** | Point, Line, Text |
| **Channels** | Color, Size, Spatial position (x, y) |
| **Idioms** | Choropleth map, Bubble map, Sankey diagram |

---

## 🍸 Storytelling Structure — Martini Glass

The user experience follows the **Martini Glass** narrative pattern:

```
Intro (structured)
     │
     │  Sankey — national budget flow
     │
     ▼
  Author-driven narrative
     │
     │  Bubble charts — expenditure types & investment projects
     │
     ▼
  User-driven exploration
     │
     │  Interactive maps — municipal distribution & per-capita spending
     ▼
```

The story starts with a controlled, structured introduction and gradually opens into free exploration, letting users drill into the data at their own pace.

---

## 💡 Key Insights

- Budget distribution is heavily **concentrated in central Colombia**, particularly in high-density urban areas
- When viewed **per capita**, a very different picture emerges — municipalities in Putumayo, San Andrés, Chocó, and Cota (Cundinamarca) stand out
- The investment projects with the largest allocations relate to **ethnic integration and preservation of ancestral knowledge**
- **Traditional kitchens** (*Cocinas Tradicionales*) in the Pacific region show a notable geographic concentration
- Rural areas appear **underrepresented** in absolute budget terms relative to urban centers

---

## 🛠️ Tech Stack

- **D3.js** — all charts and maps
- **HTML / CSS / JavaScript** — scrollytelling interactions
- **Nunito Sans** — typography (as recommended by the Ministry's visual identity guidelines)
- Hosted on **Azure Static Web Apps**

---

## 🚀 Running Locally
 
Download all files and place them in the **same folder**. All data files, JavaScript scripts, images, and the HTML files must live at the same directory level:
 
```
proyecto_va/
├── index.html
├── main.html
├── main.js              
├── *.json / *.geojson    # Data files
├── *.png / *.svg     # Images and assets
└── ...
```
 
Then simply open `index.html` in your browser. No build step or server required.
 
---

## 📅 Development Timeline

| Phase | Period |
|---|---|
| Data acquisition & characterization | Week 1–2 |
| Initial prototype | Week 1–2 |
| Data integration into visualization | Week 2 |
| Prototyping iterations | Week 3 |
| User validation (tactical level) | Week 3 |
| Visualization adjustments | Week 3 |
| Final adjustments & presentation | Week 3–4 |

---

## 👥 User Validation

Two rounds of validation were conducted:

**Round 1 — Tactical users (course peers)**
Feedback highlighted: pleasant color palette, readability issues at distance, missing legends, and unclear connection between visuals and budget purpose. Adjustments included adding tooltips, legends, titles, currency symbols, better sphere sizing on maps, and filters.

**Round 2 — Strategic users (Ministry of Culture — Planeación Office)**
Feedback led to: dark background matching the institutional portal, Nunito Sans typography, differentiated colors for expenditure types, color-coded maps for investment amounts, and a transparent budget summary overlay.

---

## 👨‍💻 Authors

| Name | Institution |
|---|---|
| Yachay Julian Tolosa Bello | Universidad de los Andes |
| Ayman Benazzouz El Hri | Universidad de los Andes |
| Jenniffer Escudero Perdomo | Universidad de los Andes |
| David Ricardo Saavedra Martínez | Universidad de los Andes |

---

## 📄 License

This project was developed as part of an academic course. Dataset provided by Colombia's Ministry of Culture. Visual identity assets belong to the Colombian government.
