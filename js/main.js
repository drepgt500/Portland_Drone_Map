/* Script by Daniil Repchenko, 2019 */
/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-console*/
/*eslint-disable no-unreachable*/

(function(){

    //begin script when window loads
    window.onload = setMap();

    //map frame dimensions
    var width = window.innerWidth * .95,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Oregon
    var projection = d3.geo.albers()
        .center([0, 44.25])
        .rotate([121.2, 0])
        .parallels([43, 45.3])
        .scale(4500)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    //set up choropleth map
    function setMap(){

        //use queue to parallelize asynchronous data loading
        d3.queue()
            .defer(d3.json, "data/AirportBuffer.topojson") //load
            .defer(d3.json, "data/Airports.topojson") //load
            .defer(d3.json, "data/Arenas.topojson") //Load
            .defer(d3.json, "data/DOF.topojson") //Load
            .defer(d3.json, "data/Hospitals.topojson") //Load
            .defer(d3.json, "data/Parks.topojson") //Load
            .defer(d3.json, "data/Police.topojson") //Load
            .defer(d3.json, "data/Portland.topojson") //Load
            .defer(d3.json, "data/Schools.topojson") //Load
            .await(callback);

        //used to invoke functions set colors scale, translate topojson and join data
        function callback(error, airportBuffer, airports, arenas, dof, hospitals, parks, police, portland, schools){
            //translate TopoJSON
            var pdxBuffers = topojson.feature(airportBuffer, airportBuffer.objects.AirportBuffer),
                pdxAirports = topojson.feature(airports, airports.objects.Airports),
                pdxArenas = topojson.feature(arenas, arenas.objects.Arenas),
                pdxDOF = topojson.feature(dof, dof.objects.DOF),
                pdxHospitals = topojson.feature(hospitals, hospitals.objects.Hospitals),
                pdxParks = topojson.feature(parks, parks.objects.Parks),
                pdxPolice = topojson.feature(police, police.objects.Police),
                pdxPortland = topojson.feature(portland, portland.objects.Portland),
                pdxSchools = topojson.feature(schools, schools.objects.Schools).features;


        };
};




})();
