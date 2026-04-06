const ancho = 500;
const alto = 650;
const x_center = ancho / 2;
const y_center = 300;


d3.select("#viz_area").attr("width", ancho).attr("height", alto);

const svg = d3.select("#viz_area")
    .append("svg")
    .attr("width", ancho)
    .attr("height", alto)
    .style("overflow", "hidden")
    .style("overflow", "hidden")
    .append("g");

const panel = d3.select("#viz_area").append("g").classed("panel", true).attr("transform", "translate(800, 150)")


const formater = d3.formatLocale({
    decimal: ",",
    thousands: ".",
    grouping: [3],
    currency: ["$", ""]
});

const dinero = formater.format("$,.0f");
const dinero_circulos = (x) => formater.format("$,.3s")(x).replace("G", "MM");

let colombia, geojson_dptos;
const projection = d3.geoMercator().scale(2000).center([-66, 6])
const path = d3.geoPath().projection(projection)

let simulation;
let area;
let total;
let data;
let filter = {};


const primary_color = "#8C1AED";

const tip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltipa")


async function load_data() {
    colombia = await d3.json("colombia.geojson");
    geojson_dptos = await d3.json("departamentos.geojson");
    //data = await d3.json("https://as-eu2-dev-sinic-02.azurewebsites.net/api/general/query?tabla=fact_ejecucion_presupuestal&dimensiones=[divipola];[Departamento];[Municipio];[proyecto];[Latitud];[Longitud];[Poblaci%C3%B3n];[fuente];[Subregi%C3%B3n%20PDET]&medidas=ejecutado;SUM(fact_ejecucion_presupuestal[Obligado])");
    data = await d3.json("query.json");
    data = data.filter(d => d.ejecutado > 0).map(d => {
        if (d.divipola == "88564") {
            d.Latitud = 11.7546
            d.Longitud = -77.7726
        } else if (d.divipola == "88001") {
            d.Latitud = 11.2339
            d.Longitud = -78.7503
        } else if (d.divipola == "88000") {
            d.Latitud = 11.5598
            d.Longitud = -78.2699
        }
        return d;
    })


    total = data.reduce((a, b) => a + b.ejecutado, 0);
    area = d3.scaleLinear([1, total], [10, 100000])
    document.getElementById("loading-div").classList.add("d-none")

    const departamentos = [...new Set(data.map(d => d.Departamento))].sort(d3.ascending);
    for (const depto of departamentos)
        d3.select("#menu-deptos").append("a").classed('dropdown-item', true).attr("onclick", `filtrar('Departamento', '${depto}')`).text(depto);

    const proyectos = [...new Set(data.map(d => d.proyecto))].sort(d3.ascending);
    for (const proyecto of proyectos)
        d3.select("#menu-proyectos").append("a").classed('dropdown-item', true).attr("onclick", `filtrar('proyecto', '${proyecto}')`).text(proyecto);

    get_state(false)
}

function get_data(group_by = null, filter = null, keep = []) {
    let new_data = data;
    if (filter)
        new_data = new_data.filter(d => Object.entries(filter).reduce((a, b) => (a && d[b[0]] === b[1]), true))

    return d3.groups(new_data, d => d[group_by]).map(d => d[1].reduce((a, b) => {
        for (const k of keep) {
            a[k] = b[k];
        }
        a.id = d[0];
        a[group_by] = d[0];
        a.ejecutado += b.ejecutado;
        return a;
    }, {ejecutado: 0}))
}


function create(selection, area_scale) {
    // creamos los contenedores
    const contenedores = selection
        .append("g")
        .classed("contenedor", true)
        .attr("transform", `translate(${x_center}, ${y_center})`)

    contenedores
        .transition().duration(250)
        .attr("transform", d => `translate(${d.x0}, ${d.y0})`)


    // creamos los círculos
    contenedores
        .append("path")
        .classed("circles", true)
        .attr("d", d3.symbol().size(1))
        .attr("fill", "var(--color9)")
        .transition().duration(250)
        .attr("d", d3.symbol().size(d => area_scale(d.valor)))
    //.attr("opacity", 0.95)

    // const f = formater.formatPrefix(",.0", 1e6);
    contenedores
        .filter(d => d.valor > 2e11)
        .append("text")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .style("font", "20px 'Nunito Sans', sans-serif")
        .text(d => dinero_circulos(d.valor))
        .style("opacity", 0)
        .transition().delay(250)
        .duration(250)
        .style("opacity", 1)
        .style("fill", "#DDD")


    return contenedores;
}


function actualizar(selection, area_scale) {
    // Ajustamos el tamaño de los circulos
    selection
        .select("path")
        .transition().duration(250)
        .attr("d", d3.symbol().size(d => area_scale(d.valor)))

    // Ajustamos el texto
    selection
        .select("text")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .style("font", "20px")
        .text(d => dinero_circulos(d.valor))
        .style("opacity", 0)
        .style("display", d => d.valor > 2e11 ? "block" : "none")
        .transition().delay(250)
        .duration(250)
        .style("opacity", 1)

    return selection;
}

function remove(selection, geo = false) {
    selection
        .selectAll("path")
        .transition().duration(250)
        .attr("d", d3.symbol().size(1))

    if (!geo)
        selection
            .transition().duration(250)
            .attr("transform", `translate(${x_center}, ${y_center})`)
            .remove()
    else


        return selection
            .transition().duration(250)
            .remove()
}


function show_balls(data, geo = false, area_scale = area) {
    if (simulation) simulation.stop();
    svg.selectAll(".basemap").remove();

    data = data.filter(d => d.valor > 0)

    data.map(d => {
        if (geo) {
            if (!d.Longitud || !d.Latitud)
                [d.x0, d.y0] = projection([-69.5534, 10.3278]);
            else
                [d.x0, d.y0] = projection([d.Longitud, d.Latitud]);
        } else {
            d.x0 = x_center;
            d.y0 = y_center;
        }
        d.x = d.x0;
        d.y = d.y0;
    })

    if (geo) {
        const map = svg
            .insert("path", ":first-child")
            .classed("basemap", true)
            .attr("d", path(colombia.features[0]))
            .attr("fill", "var(--color-map)")
    }

    // creamos los contenedores de los círculos
    return svg
        .selectAll(".contenedor")
        .data(data, d => d.id || this.id)
        .join(
            enter => create(enter, area_scale),
            update => actualizar(update, area_scale),
            exit => remove(exit, geo)
        )
}

function repulsion(contenedores, data, area_scale) {
    simulation = d3
        .forceSimulation(data)
        .velocityDecay(0.4)
        .alphaDecay(0.09)
        .force("colide", d3.forceCollide(d => Math.sqrt(area_scale(d.valor) / Math.PI) + 0.1).strength(1))
        .force("x", d3.forceX().x(d => d.x0).strength(1))
        .force("y", d3.forceY().y(d => d.y0).strength(1))
        // .force("z", d3.forceRadial(d => 2*Math.sqrt(area_scale(d.valor) / Math.PI),  x_center, y_center).strength(1))
        .on("tick", () => contenedores.attr("transform", d => `translate(${d.x}, ${d.y})`))

    return simulation
}

function tooltips(contenedores, contenido) {
    contenedores
        .on("mouseenter", (event, d) => {
                tip.style("display", "block")
                    .html(contenido(d))
                    .style("left", event.x + "px")
                    .style("top", event.y + "px")
            }
        )
        .on("mouseleave", () => tip.style("display", "none"))
}

function labels(contenedores, area_scale = area, padding = 15) {
    contenedores
        .filter(d => d.valor > 1e11)
        .append("line")

        .attr("x1", 0)
        .attr("y1", d => -Math.sqrt(area_scale(d.valor) / Math.PI))
        .attr("x2", 0)
        .attr("y2", d => -Math.sqrt(area_scale(d.valor) / Math.PI) - padding)
        .transition().delay(500)
        .attr("stroke", "white")

    contenedores
        .filter(d => d.valor > 1e11)
        .append("text")
        .attr("x", 0)
        .attr("y", d => -Math.sqrt(area_scale(d.valor) / Math.PI) - padding - 10)
        .attr("text-anchor", "middle")
        .style("font", "20px 'Nunito Sans', sans-serif")
        .style("fill", "#DDD")
        .transition().delay(500)
        .text(d => d.id)
}

async function show_total() {
    const data = [{id: "Presupuesto total", valor: total}]
    const contenedores = show_balls(data)
    contenedores
        .selectAll(".circles")
        .attr("fill", "var(--color3)")

    tooltips(
        contenedores,
        d => `<div style="padding:10px"><h5>Presupuesto total ejecutado</h5><div> ${dinero(d.valor)}</div></div>`
    );

    labels(contenedores)
    await repulsion(contenedores, data, area)
}

async function show_fuentes() {
    const data = get_data("fuente", filter).map(d => {
        d.valor = d.ejecutado;
        return d
    })
    const contenedores = show_balls(data)

    contenedores
        .selectAll(".circles")
        .attr("fill", "var(--color7)")

    tooltips(
        contenedores,
        d => `<div style="padding:10px"><h5>${d.fuente}</h5><div> ${dinero(d.valor)}</div></div>`
    );
    labels(contenedores, area)

    await (new Promise(r => setTimeout(r, 250)));
    repulsion(contenedores, data, area)
}

async function show_proyectos() {
    const data = get_data("proyecto", filter).filter(d => d.proyecto).map(d => {
        d.valor = d.ejecutado;
        return d
    })

    const contenedores = show_balls(data);
    contenedores
        .selectAll(".circles")
        .attr("fill", "var(--color2)")
        .attr("opacity", 1)
        .attr("stroke", "#17102E")
        .attr("stroke-width", 1)

    tooltips(
        contenedores,
        d => `<div style="padding:10px"><h5>${d.proyecto}</h5><div> ${dinero(d.valor)}</div></div>`
    );
    await (new Promise(r => setTimeout(r, 250)));
    repulsion(contenedores, data, area)
}


async function show_municipios() {
    const percapita = document.getElementById("check_percapita").checked
    let max_value = 0;
    let min_value = 999999999999999999;
    let contenedores;
    let area_municipios;

    let data = get_data("divipola", filter, ["Población", "Municipio", "Departamento", "Latitud", "Longitud"]).map(d => {
        if (percapita)
            d.valor = d.ejecutado / d.Población || 0;
        else
            d.valor = d.ejecutado;
        return d
    })

    max_value = d3.quantile(data.map(d => d.valor), 0.99)
    min_value = d3.quantile(data.map(d => d.valor), 0.01)

    if (!percapita) {

        area_municipios = d3.scaleLinear([1, total], [10, 13000]);
        contenedores = show_balls(data, true, area_municipios)
        tooltips(
            contenedores,
            d => `<div style="padding:10px"><h5>${d.Municipio}, ${d.Departamento}</h5><div> ${dinero(d.valor)}</div></div>`
        );

        contenedores
            .selectAll(".circles")
            .attr("fill", "var(--color2)")
            .attr("stroke", "var(--color1)")
            .attr("stroke-width", 1)
    } else {
        area_municipios = d3.scaleLinear([min_value, max_value], [10, 70])
        contenedores = show_balls(data, true, area_municipios)
        tooltips(
            contenedores,
            d => `
                    <div style="padding:10px">
                        <h5>${d.Municipio}, ${d.Departamento}</h5>
                        <div>Presupuesto por habitante: ${dinero(d.valor)}</div>
                        <div>Presupuesto: ${dinero(d.ejecutado)}</div>
                        <div>Habitantes: ${formater.format(",.0f")(d.Población)}</div>
                    </div>`
        );
        contenedores
            .selectAll(".circles")
            .attr("fill", "var(--color9)")
            .attr("stroke", "var(--color1)")
            .attr("stroke-width", 1)

    }


    await (new Promise(r => setTimeout(r, 250)));
    repulsion(contenedores, data, area_municipios)

    return contenedores
}


function create_panel() {
    const panel_proyectos = panel.append("g").classed("proyecto", true);
    panel_proyectos.append("g").classed("eje_y", true)
    panel_proyectos.append("g").classed("eje_x", true).attr("transform", "translate(0, 400)")
    // panel_proyectos.append("g").classed("barras", true)

}

function bars(categoria, filtro = false) {
    const new_filter = {...filter}
    delete new_filter["proyecto"]
    const data = get_data(categoria, new_filter).map(d => {
        d.valor = d.ejecutado;
        return d
    }).filter(d => d.id)
    const data_max = d3.max(data, d => d.valor);
    const categorias = data.sort((a, b) => b.valor - a.valor).map(d => d[categoria])

    const x = d3.scaleLinear()
        .domain([0, data_max])
        .range([0, 140]);

    const y = d3.scaleBand()
        .range([0, 400])
        .domain(categorias)
        .padding(1);


    const panel_proyectos = panel.select(`.${categoria}`)

    panel_proyectos.select(".eje_y").transition().duration(250).call(d3.axisLeft(y));

    panel_proyectos.select(".eje_x").transition().duration(250).call(d3.axisBottom(x).ticks(2, "s"))
        .selectAll("text")
        .style("text-anchor", "center")
        .text(d => dinero_circulos(d));


    const contenedores = panel_proyectos
        .selectAll(".lineas")
        .data(data)
        .join(
            enter => enter
                .append("g")
                .classed("lineas", true)
                .call(selection => selection
                    .append("line")
                    .transition().duration(250)
                    .attr("x1", x(0))
                    .attr("x2", d => x(d.valor))
                    .attr("y1", d => y(d[categoria]))
                    .attr("y2", d => y(d[categoria]))
                    .attr("stroke", "var(--color9)")
                    .attr("stroke-width", 1)
                )
                .call(selection => selection
                    .append("circle")
                    .transition().duration(250)
                    .attr("cx", d => x(d.valor))
                    .attr("cy", d => y(d[categoria]))
                    .attr("r", d => filter.proyecto === d.proyecto ? 7 : 3)
                    .attr("fill", d => filter.proyecto === d.proyecto ? "var(--color7)" : "var(--color9)")
                    .attr("stroke", "var(--color9)")
                    .attr("stroke-width", 1)
                )
            ,
            update => update
                .call(selection => selection
                    .select("line")
                    .transition().duration(250)
                    .attr("x1", x(0))
                    .attr("x2", d => x(d.valor))
                    .attr("y1", d => y(d[categoria]))
                    .attr("y2", d => y(d[categoria]))
                    .attr("stroke", "var(--color9)")
                    .attr("stroke-width", 1)
                )
                .call(selection => selection
                    .select("circle")
                    .transition().duration(250)
                    .attr("cx", d => x(d.valor))
                    .attr("cy", d => y(d[categoria]))
                    .attr("r", d => filter.proyecto === d.proyecto ? 7 : 4)
                    .attr("fill", d => filter.proyecto === d.proyecto ? "var(--color7)" : "var(--color9)")
                    .attr("stroke", "var(--color9)")
                    .attr("stroke-width", 1)
                ),
            exit => exit.remove()
        )
    tooltips(
        contenedores,
        d => `<div style="padding:10px"><h5>${d.id}</h5><div> ${dinero(d.valor)}</div></div>`
    );
}


function filtrar(campo, valor) {
    if (campo === undefined) {
        filter = {}
    } else if (valor === "Todos") {
        delete filter[campo];
    } else {
        filter[campo] = valor;
    }
    get_state(false)
}

let last_scroll_position = 0

async function get_state(scroll = true) {
    const imagen_inicial = document.getElementsByClassName("seccion")[0].getBoundingClientRect().top + window.scrollY;
    let bajando;
    bajando = last_scroll_position < window.scrollY;

    last_scroll_position = window.scrollY;


    if (total) {
        const limit = -imagen_inicial + Math.max(document.body.scrollHeight, document.body.offsetHeight,
            document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) - window.innerHeight;
        const porcentaje = (window.scrollY - imagen_inicial) / limit;
        const secciones = 6;
        // svg.attr("transform", d => `translate(0, 0)`)

        if (window.scrollY < imagen_inicial - 200) {
            svg.selectAll('*').remove();
            current_state = 0
            return
        }

        let seccion;

        console.log((window.scrollY - imagen_inicial) / window.innerHeight + 1)
        if (scroll) {
            seccion = (window.scrollY - imagen_inicial) / window.innerHeight + 1
            if (
                Math.min(
                    Math.abs(seccion - Math.ceil(seccion)),
                    Math.abs(seccion - Math.ceil(seccion))
                ) < 0.001
            ) {
                seccion = current_state
            } else if (bajando) {
                seccion = Math.ceil((window.scrollY - imagen_inicial) / window.innerHeight + 1)
            } else {
                seccion = Math.floor((window.scrollY - imagen_inicial) / window.innerHeight + 1)
            }


            if (seccion === 0) return

            d3.selectAll("p, h1").style("opacity", 0)

            window.scrollTo({top: imagen_inicial + window.innerHeight * (seccion - 1)})

            if (Math.abs(seccion - (window.scrollY - imagen_inicial) / window.innerHeight - 1) < 0.5) {
                d3.selectAll("p, h1").transition().duration(250).style("opacity", 1)
                if (current_state !== seccion)
                    current_state = seccion
                else
                    return
            } else {

                return
            }
        } else {
            seccion = current_state
        }

        if (seccion !== 6) {
            panel.selectAll("*").transition().duration(250).remove();
            d3.select("#viz_area").transition().duration(250).attr("width", ancho).attr("height", alto);
            svg.transition().duration(250).attr("transform", d => `translate(0, 0)`)
            filter = {}
        }

        switch (seccion) {
            case 1:
                show_total();
                break
            case 2:
                show_fuentes();
                break
            case 3:
                show_proyectos();
                break
            case 4:
                document.getElementById("check_percapita").checked = false;
                show_municipios();
                break
            case 5:
                document.getElementById("check_percapita").checked = true;
                show_municipios();
                break
            case 6:
                create_panel()
                d3.select("#viz_area").transition().duration(250).attr("width", 1024).attr("height", alto);
                svg.transition().duration(250).attr("transform", d => `translate(0, 40)`)


                bars("proyecto")
                current_state = 6

                let contenedores = await show_municipios()


                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                let departamentoDivipola = data.reduce((acc, registro) => {
                    const departamento = registro.Departamento;
                    const divipolaPrefix = registro.divipola.substring(0, 2); // Primeros dos caracteres

                    if (!acc[departamento]) {
                        acc[departamento] = divipolaPrefix; // Usamos un Set para evitar duplicados
                    }
                    return acc;
                }, {});

                if (filter["Departamento"]) {
                    const deptoSeleccionado = geojson_dptos.features.find(feature => feature.properties.divipola_dpto === departamentoDivipola[filter["Departamento"]]);
                    const bounds = path.bounds(deptoSeleccionado);
                    const dx = bounds[1][0] - bounds[0][0];
                    const dy = bounds[1][1] - bounds[0][1];
                    const x = (bounds[0][0] + bounds[1][0]) / 2;
                    const y = (bounds[0][1] + bounds[1][1]) / 2;
                    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / ancho, dy / alto)));
                    const translate = [ancho / 2 - scale * x, alto / 2 - scale * y];
                    svg.transition().duration(750).attr("transform", `translate(${translate}) scale(${scale})`)
                } else {
                    svg.transition().duration(750).attr("transform", d => `translate(0, 40)`);
                }
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                contenedores
                    .on("mouseenter.filter", (event, d) => {
                            filter["divipola"] = d.divipola;
                            bars("proyecto")
                        }
                    )
                    .on("mouseleave.filter", () => {
                        delete filter["divipola"];
                        bars("proyecto")
                    })
                break
        }
    }
}

let current_state = -1;
document.addEventListener("scroll", get_state);
document.getElementById("check_percapita").addEventListener("change", () => get_state(false))

load_data()
