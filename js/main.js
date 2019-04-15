(function(){

    //map dimensions
    var margin = {top: 50, left: 50, bottom: 50, right: 10},
        height = window.innerHeight,
        height = height - margin.top - margin.bottom,
        width = window.innerWidth,
        width = width - margin.left - margin.right;

    window.onload = setMap(width, height);

     //set up choropleth map
    function setMap(width, height){

        //create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on lorain
        var projection = d3.geo.albers()
        .center([0, 45.54])
        .rotate([122.6, 0])
        .parallels([43, 45.3])
        .scale(100000)
        .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

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
            .await(callback);

        function callback(error, portland, airports, arenas, hospitals, police, parks, buffer, dof, school){
            //translate lorain TopoJSON

            var portlandOutline = topojson.feature(portland, portland.objects.Portland);
            var airportXY = topojson.feature(airports, airports.objects.Airports);
            var arenasXY = topojson.feature(arenas, arenas.objects.Arenas);
            var hospitalsXY = topojson.feature(hospitals, hospitals.objects.Hospitals);
            var policeXY = topojson.feature(police, police.objects.Police);
            var parksXY = topojson.feature(parks, parks.objects.Parks);
            var arptbuffers = topojson.feature(buffer, buffer.objects.AirportBuffer);
            var dofXY = topojson.feature(dof, dof.objects.DOF);
            var schoolXY = topojson.feature(school, school.objects.SchoolsWGS84);

            var portOut = map.append("path")
                .datum(portlandOutline)
                .attr("class", "portland")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", "#000")
                .style("stroke-width", .5);

            var pdxAirports = map.selectAll(".pdxAirports")
                .data(airportXY.features)
                .enter()
                .append("path")
                .attr("class", "airport")
                .attr("d", path)
                .style("fill", "#E04DEB");

            var pdxArenas = map.selectAll(".pdxArenas")
                .data(arenasXY.features)
                .enter()
                .append("path")
                .attr("class", "arena")
                .attr("d", path)
                .style("fill", "#6B91FF");

            var pdxHospitals = map.selectAll(".pdxHospitals")
                .data(hospitalsXY.features)
                .enter()
                .append("path")
                .attr("class", "hospital")
                .attr("d", path)
                .style("fill", "#79FF8F");

            var pdxPolice = map.selectAll(".pdxPolice")
                .data(policeXY.features)
                .enter()
                .append("path")
                .attr("class", "police")
                .attr("d", path)
                .style("stroke", "#EB1F18")
                .style("fill", "#2436FF");

            var pdxParks = map.selectAll(".pdxParks")
                .data(parksXY.features)
                .enter()
                .append("path")
                .attr("class", "park")
                .attr("d", path)
                .style("fill", "#108C01");

            var pdxBuffers = map.selectAll(".pdxBuffers")
                .data(arptbuffers.features)
                .enter()
                .append("path")
                .attr("class", "buffer")
                .attr("d", path)
                .style("opacity", ".2")
                .style("fill", "#F03B30");

            var pdxDOF = map.selectAll(".pdxDOF")
                .data(dofXY.features)
                .enter()
                .append("path")
                .attr("class", "dof")
                .attr("d", path)
                .style("fill", "#F03B30");

            var pdxschools = map.selectAll(".pdxschools")
                .data(schoolXY.features)
                .enter()
                .append("path")
                .attr("class", "school")
                .attr("d", path)
                .style("fill", "#343B30");


        };
    };

})();
