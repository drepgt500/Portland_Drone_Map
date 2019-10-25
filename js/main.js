(function(){

    //map dimensions
    var margin = {top: 50, left: 50, bottom: 100, right: 10},
        height = window.innerHeight,
        height = height - margin.top - margin.bottom,
        width = window.innerWidth,
        width = width - margin.left - margin.right;

    window.onload = setMap(width, height);

     //set up choropleth map
    function setMap(width, height){

        //create new svg container for the map with zoom and pan (zoom is limited)
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height)
            .call(d3.behavior.zoom()
                  .scaleExtent([1,20])
                  .on("zoom", function () {
                map.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
            }))
            .append("g");



        //create Albers equal area conic projection centered on Portland
        var projection = d3.geo.albers()
        .center([0, 45.54])
        .rotate([122.6, 0])
        .parallels([43, 45.3])
        .scale(100000)
        .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection)
            .pointRadius(.5);

        //use queue to parallelize asynchronous data loading
        d3.queue()

            .defer(d3.json, "data/Portland.topojson")
            .defer(d3.json, "data/Airports.topojson")
            .defer(d3.json, "data/Arenas.topojson")
            .defer(d3.json, "data/Hospitals.topojson")
            .defer(d3.json, "data/Police.topojson")
            .defer(d3.json, "data/Parks.topojson")
            .defer(d3.json, "data/AirportBuffer.topojson")
            .defer(d3.json, "data/DOF.topojson")
            .defer(d3.json, "data/SchoolsWGS84.topojson")
            .defer(d3.json, "data/Roads.topojson")
            .defer(d3.json, "data/Water.topojson")
            .await(callback);

        function callback(error, portland, airports, arenas, hospitals, police, parks, buffer, dof, school, roads, water){
            //translate TopoJSON files

            var portlandOutline = topojson.feature(portland, portland.objects.Portland);
            var airportXY = topojson.feature(airports, airports.objects.Airports);
            var arenasXY = topojson.feature(arenas, arenas.objects.Arenas);
            var hospitalsXY = topojson.feature(hospitals, hospitals.objects.Hospitals);
            var policeXY = topojson.feature(police, police.objects.Police);
            var parksXY = topojson.feature(parks, parks.objects.Parks);
            var arptbuffers = topojson.feature(buffer, buffer.objects.AirportBuffer);
            var dofXY = topojson.feature(dof, dof.objects.DOF);
            var schoolXY = topojson.feature(school, school.objects.SchoolsWGS84);
            var roadsXY = topojson.feature(roads, roads.objects.Trans_RoadSegment_wgs84);
            var waterXY = topojson.feature(water, water.objects.portlandoregonwaterbodies1);

            //add Portland boundary
            var portOut1 = map.append("path")
                .datum(portlandOutline)
                .attr("class", "portland")
                .attr("d", path)
                .style("opacity", ".2")
                .style("fill", "#A3804B");

            //add roads
            var pdxroads = map.selectAll(".pdxroads")
                .data(roadsXY.features)
                .enter()
                .append("path")
                .attr("class", "roads")
                .attr("d", path)
                .style("stroke-width", ".2")
                .style("fill", "none")
                .style("stroke", "#9AABA4");

            //add 5-mile airport buffers
            var pdxBuffers = map.selectAll(".pdxBuffers")
                .data(arptbuffers.features)
                .enter()
                .append("path")
                .attr("class", "buffer")
                .attr("d", path)
                .style("opacity", ".2")
                .style("fill", "#000");

            //toggle buffers
          var bufferCheckbox = document.querySelector('input[id="buffer_toggle"]')

            //check if check box is checked or unchecked
            bufferCheckbox.onchange = function() {
                if(this.checked) {
                  map.selectAll(".buffer").attr("visibility", "visible");
                } else {
                  map.selectAll(".buffer").attr("visibility", "hidden");
                }
              };

            //add water features
            var pdxwater = map.selectAll(".pdxwater")
                .data(waterXY.features)
                .enter()
                .append("path")
                .attr("class", "water")
                .attr("d", path)
                .style("opacity", ".7")
                .style("stroke-width", ".1")
                .style("fill", "#94C1DE")
                .style("stroke", "#649ADF");

            //add Portland boundary
            var portOut = map.append("path")
                .datum(portlandOutline)
                .attr("class", "portland")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", "#000")
                .style("stroke-width", .2);

            //add airport layer
            var pdxAirports = map.selectAll(".pdxAirports")
                .data(airportXY)
                .enter()
                .append("path")
                .attr("class", "airport")
                .attr("d", path)
                .style("stroke-width", "1")
                .style("stroke", "black")
                .style("fill", "black")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("fill", "blue")
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                    setLabelAir(d.properties)
            })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("stroke", "black")
                        .style("fill", "black")
                        .style("stroke-width", "1")
                    removeLabel();
                })
                .on("mousemove", moveLabel);


            //add parks layer
            var pdxParks = map.selectAll(".pdxParks")
                .data(parksXY.features)
                .enter()
                .append("path")
                .attr("class", "park")
                .attr("d", path)
                .style("opacity", ".5")
                .style("fill", "#4DB34D")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("fill", "blue")
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                    setLabelOther(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("fill", "#4DB34D")
                        .style("stroke", "#4DB34D")
                    removeLabel();
                })
                .on("mousemove", moveLabel);

            //add arenas layer
            var pdxArenas = map.selectAll(".pdxArenas")
                .data(arenasXY.features)
                .enter()
                .append("path")
                .attr("class", "arena")
                .attr("d", path)
                .style("stroke-width", "1")
                .style("stroke", "#BA55D4")
                .style("fill", "#BA55D4")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                        .style("fill", "blue")
                    setLabelOther(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("stroke", "#BA55D4")
                        .style("fill", "#BA55D4")
                        .style("stroke-width", "1")
                    removeLabel();
                })
                .on("mousemove", moveLabel);

            //toggle arenas
            var arenaCheckbox = document.querySelector('input[id="arena_toggle"]')

              //check if check box is checked or unchecked
              arenaCheckbox.onchange = function() {
                  if(this.checked) {
                    map.selectAll(".arena").attr("visibility", "visible");
                  } else {
                    map.selectAll(".arena").attr("visibility", "hidden");
                  }
                };

            //add hospitals layer
            var pdxHospitals = map.selectAll(".pdxHospitals")
                .data(hospitalsXY.features)
                .enter()
                .append("path")
                .attr("class", "hospital")
                .attr("d", path)
                .style("stroke-width", "1")
                .style("stroke", "#C23327")
                .style("fill", "#C23327")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                        .style("fill", "blue")
                    setLabelOther(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("stroke", "#C23327")
                        .style("fill", "#C23327")
                        .style("stroke-width", "1")
                    removeLabel();
                })
                .on("mousemove", moveLabel);

            //toggle hospitals
            var hospitalCheckbox = document.querySelector('input[id="hospital_toggle"]')

                //check if check box is checked or unchecked
                hospitalCheckbox.onchange = function() {
                  if(this.checked) {
                    map.selectAll(".hospital").attr("visibility", "visible");
                  } else {
                    map.selectAll(".hospital").attr("visibility", "hidden");
                  }
                };

            //add police stations layer
            var pdxPolice = map.selectAll(".pdxPolice")
                .data(policeXY.features)
                .enter()
                .append("path")
                .attr("class", "police")
                .attr("d", path)
                .style("stroke-width", "1")
                .style("stroke", "#3E4CB3")
                .style("fill", "#3E4CB3")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                        .style("fill", "blue")
                    setLabelOther(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("stroke", "#3E4CB3")
                        .style("fill", "#3E4CB3")
                        .style("stroke-width", "1")
                    removeLabel();
                })
                .on("mousemove", moveLabel);

            //toggle police stations
            var policeCheckbox = document.querySelector('input[id="police_toggle"]')

                //check if check box is checked or unchecked
                policeCheckbox.onchange = function() {
                  if(this.checked) {
                    map.selectAll(".police").attr("visibility", "visible");
                  } else {
                    map.selectAll(".police").attr("visibility", "hidden");
                  }
                };

            //add obstruction points layer
            var pdxDOF = map.selectAll(".pdxDOF")
                .data(dofXY.features)
                .enter()
                .append("path")
                .attr("class", "dof")
                .attr("d", path)
                .style("fill", "#5C3416")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("fill", "blue")
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                    setLabelDOF(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("fill", "#5C3416")
                        .style("stroke", "#5C3416")
                        .style("stroke-width", "0")

                    d3.select(".infolabelDOF")
                        .remove();
                })
                .on("mousemove", moveLabelDOF);

            //toggle obstruction points
            var obstructionCheckbox = document.querySelector('input[id="obstruction_toggle"]')

              //check if check box is checked or unchecked
              obstructionCheckbox.onchange = function() {
                  if(this.checked) {
                    map.selectAll(".dof").attr("visibility", "visible");
                  } else {
                    map.selectAll(".dof").attr("visibility", "hidden");
                  }
                };

            //add schools layer
            var pdxschools = map.selectAll(".pdxschools")
                .data(schoolXY.features)
                .enter()
                .append("path")
                .attr("class", "school")
                .attr("d", path)
                .style("fill", "#258F88")
                .on("mouseover", function(d){
                    d3.select(this)
                        .style("fill", "blue")
                        .style("stroke", "yellow")
                        .style("stroke-width", ".2")
                    setLabelOther(d.properties);
                })
                .on("mouseout", function(d){
                    d3.select(this)
                        .style("fill", "#258F88")
                        .style("stroke", "#258F88")
                        .style("stroke-width", "0")
                    removeLabel();
                })
                .on("mousemove", moveLabel);

            //toggle schools
            var schoolCheckbox = document.querySelector('input[id="school_toggle"]')

                //check if check box is checked or unchecked
                schoolCheckbox.onchange = function() {
                  if(this.checked) {
                    map.selectAll(".school").attr("visibility", "visible");
                  } else {
                    map.selectAll(".school").attr("visibility", "hidden");
                  }
                };

            //function to create dynamic label for airports
            function setLabelAir(props){

                //create info label div
                var infolabel = d3.select("body")
                    .append("div")
                    .attr("class", "infolabel")
                    .attr("id", props.Name + "_label")
                    .html(props.Name);
                    };

            //function to create label for obstruction points
            function setLabelDOF(props){
                //label content
                var labelAttribute = "<p>" + props.TYPE +
                                    "<br>" + "AGL" + ":" + " " + props.AGL + "</p>"

                //create info label div
                var infolabel = d3.select("body")
                    .append("div")
                    .attr("class", "infolabelDOF")
                    .attr("id", props.TYPE + "_label")
                    .html(labelAttribute);
                    };

            //function to create label for schools, arenas, hospitals, police stations, and parks
            function setLabelOther(props){

                //create info label div
                var infolabel = d3.select("body")
                    .append("div")
                    .attr("class", "infolabel")
                    .attr("id", props.NAME + "_label")
                    .html(props.NAME);
                    };

            //function to move info label with mouse
            function moveLabel(){
                //get width of label
                var labelWidth = d3.select(".infolabel")
                    .node()
                    .getBoundingClientRect()
                    .width;

                //use coordinates of mousemove event to set label coordinates
                var x1 = d3.event.clientX + 10,
                    y1 = d3.event.clientY - 20,
                    x2 = d3.event.clientX - labelWidth - 10,
                    y2 = d3.event.clientY + 20;

                //horizontal label coordinate, testing for overflow
                var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
                //vertical label coordinate, testing for overflow
                var y = d3.event.clientY < 20 ? y2 : y1;


                d3.select(".infolabel")
                    .style("left", x + "px")
                    .style("top", y + "px");
                };

            //function to move info label for obstruction points with mouse
            function moveLabelDOF(){
                //get width of label
                var labelWidth = d3.select(".infolabelDOF")
                    .node()
                    .getBoundingClientRect()
                    .width;

                //use coordinates of mousemove event to set label coordinates
                var x1 = d3.event.clientX + 10,
                    y1 = d3.event.clientY - 20,
                    x2 = d3.event.clientX - labelWidth - 10,
                    y2 = d3.event.clientY + 20;

                //horizontal label coordinate, testing for overflow
                var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
                //vertical label coordinate, testing for overflow
                var y = d3.event.clientY < 20 ? y2 : y1;


                d3.select(".infolabelDOF")
                    .style("left", x + "px")
                    .style("top", y + "px");
                };
            function removeLabel(){
                //remove info label
                d3.select(".infolabel")
                    .remove();
                };

        };
    };

})();
