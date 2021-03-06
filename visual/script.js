  var svg = d3.select("svg"),
    width = window.innerHeight,
    height = window.innerWidth;

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(function (d) {
          return d.id;
        })
        .strength(0.001)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(height / 2, width / 2));

  d3.json("mis.json", function (error, graph) {
    if (error) throw error;

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("stroke-width", function (d) {
        return Math.sqrt(d.value);
      })
      .style("stroke", function (d) {
        return color(d.source);
      });

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .on("click", (d) => {
        d3.select("h1")
          .text(d.id)
          .style("text-align", "center")
          .style("text-transform", "capitalize");
        let targets = [];
        link.style("stroke-opacity", (l) => {
          if (l.source.id == d.id) {
            targets.push(l.target.id);
            return "1";
          } else {
            return "0.01";
          }
        });
        lables.style("opacity", (t) => {
          if (targets.includes(t.id)) {
            return "1";
          } else {
            return "0.1";
          }
        });
      });

    svg.on("click", function () {
      if (d3.event.target.tagName == "svg") {
        link.style("stroke-opacity", 0.6);
        lables.style("opacity", 1);
        d3.select("h1").text("");
      }
    });
    var circles = node
      .append("circle")
      .attr("r", 5)
      .attr("fill", function (d) {
        return color(d.group);
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    var lables = node
      .append("text")
      .text(function (d) {
        return d.id;
      })
      .attr("x", 6)
      .attr("y", 3)
      .style("font-size", "15px");

    node.append("title").text(function (d) {
      return d.id;
    });

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(1).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }