queue()
   .defer(d3.json, "/olympics/summer")
   .await(makeGraphs);

function makeGraphs(error, projectsJson)
{
   /*Clean projectsJson data*/
   var olympics_summer = projectsJson;
   olympics_summer.forEach(function (d)
   {
       d["Year"] = +d["Year"];
   });

   /*Create a Crossfilter instance*/
   var ndx = crossfilter(olympics_summer);

   /*Define Dimensions*/
   var yearDim = ndx.dimension(function (d) {
       return d["Year"];
   });

   var countryDim = ndx.dimension(function (d)
   {
       return d["Country"];
   });

   var generDim = ndx.dimension(function (d)
   {
       return d["Gender"];
   });

   var sportDim = ndx.dimension(function (d)
   {
       return d["Sport"];
   });

   var medalDim = ndx.dimension(function (d)
   {
       return d["Medal"];
   });

   /*Calculate metrics*/
   var numOlympicsByGender = generDim.group();
   var numOlympicsByMedals = medalDim.group();
   var numTotalMedalsByCountry = countryDim.group();
   var countryGroup = countryDim.group();
   var numListYears = yearDim.group();
   var numSport = sportDim.group();
   console.log(yearDim);

   var nested_data = d3.nest().key(function (d) { return d.Year;})
       .key(function (d) {return d.Country;})
       .rollup(function (countries) {return countries.length;})
       .entries(olympics_summer);

   var nested_data2 = d3.nest().key(function (d) { return d.Year;}).key(function (d) {return d.Sport;}).rollup(function (sports) {return sports.length;})
       .entries(olympics_summer);

   var dv = [];
        for (var i = 0; i < 23; i++) {
            var cv = {};
            cv.year = nested_data[i].key;
            cv.numofcountries = nested_data[i].values.length;
            console.log(cv);
            cv.numofsports = nested_data2[i].values.length;
            dv.push(cv);}

   /*Create a Crossfilter instance*/
   var ndx2 = crossfilter(dv);

   var yearDimArray = ndx2.dimension(function (d) {
       return d["year"];
   });

   var numcountries = yearDimArray.group().reduceSum(function (d) {
       return d["numofcountries"];
   });

   var numsports = yearDimArray.group().reduceSum(function (d) {
       return d["numofsports"];
   });

/*** Color Pallette ****/
/*
    Charts
    blue 0085c7
    yellow f4c300
    green 009f3d
    red df0024
*/
/*** Color Pallette ****/

   //Define values (to be used in charts)
   var minYear = yearDim.bottom(1)[0]["Year"];
   var maxYear = yearDim.top(1)[0]["Year"];

   //Charts
   var genderratioChart = dc.pieChart("#gender-chart");
   var medalsChart = dc.pieChart("#medals-chart");
   var timevsemdalsChart = dc.barChart("#timevsmedals-Chart");
   var totalmedalsChart = dc.rowChart("#total-medals-chart");
   var sportChart = dc.rowChart("#sport-chart");
   var timeChart = dc.barChart("#time-chart");
   var sportsyearChart = dc.lineChart("#sportyear-chart");

   <!-- Country Selector Chart -->
   var selectCountry = dc.selectMenu('#menu-select')
       .dimension(countryDim)
       .group(countryGroup);

   <!-- Year Selector Chart -->
   var selectYear = dc.selectMenu('#menu2-select')
       .dimension(yearDim)
       .group(numListYears);

   <!-- Gender Chart -->
   genderratioChart
       .ordinalColors(['#0085c7','#df0024'])
       .height(220)
       .radius(90)
       .innerRadius(40)/*this give its donut shape */
       .transitionDuration(1500)
       .label(function (d) {
        return d.value})
       .legend(dc.legend().x(10).y(10).itemHeight(13).gap(5))
       .dimension(generDim)
       .group(numOlympicsByGender);

   <!-- Medals Chart -->
   medalsChart
       .ordinalColors(['#A8511F','#FBD10B','#8E8E8F'])
       .height(220)
       .radius(90)
       .innerRadius(40)/*this give its donut shape */
       .transitionDuration(1500)
       .label(function (d) {
        return d.value})
       .legend(dc.legend().x(10).y(10).itemHeight(13).gap(5))
       .dimension(medalDim)
       .group(numOlympicsByMedals);

   <!-- Time VS Medals Chart Row -->
   timevsemdalsChart
       .ordinalColors(['#0085c7'])
       .width(750)
       .height(200)
       .margins({top: 10, right: 80, bottom: 30, left: 40})
       .dimension(yearDim)
       .group(numListYears)
       .transitionDuration(100)
       .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
       .xUnits(dc.units.ordinal)
       .elasticX(true)
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxisLabel("No. Of Medals")
       .yAxis().ticks(5);

   <!-- Top 10 Total Medals Chart Row -->
   totalmedalsChart
       .ordinalColors(['#0085c7','#f4c300','#009f3d','#df0024'] )
       .width(750)
       .height(300)
       .dimension(countryDim)
       .group(numTotalMedalsByCountry)
       .label(function (d) {
        return d.key + "  " +"("+ d.value +")" ;})
       .elasticX(true)
       .xAxis().ticks(10);
       totalmedalsChart.ordering(function (d){ return -d.value});
       totalmedalsChart.rowsCap(10);
       totalmedalsChart.othersGrouper(false);

   <!-- Number of Medals By Sport Chart -->
   sportChart
       .ordinalColors(['#0085c7','#f4c300','#009f3d','#df0024'] )
       .width(750)
       .height(962)
       .dimension(sportDim)
       .group(numSport)
       .elasticX(true)
       .label(function (d) {
        return d.key + "  " +"("+ d.value +")" ;})
       .xAxis().ticks(20);
       sportChart.ordering(function (d){ return -d.value});

   <!-- Number of Countries that won medals Chart -->
   timeChart
       .ordinalColors(['#f4c300'])
       .width(750)
       .height(200)
       .margins({top: 10, right: 80, bottom: 30, left: 40})
       .dimension(yearDimArray)
       .group(numcountries)
       .transitionDuration(100)
       .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
       .xUnits(dc.units.ordinal)
       .elasticX(true)
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxisLabel("No. Of Countries")
       .yAxis().ticks(5);

   <!-- Number of Sports By Year Chart -->
   sportsyearChart
       .ordinalColors(['#df0024'])
       .width(750)
       .height(200)
       .margins({top: 10, right: 80, bottom: 30, left: 40})
       .dimension(yearDimArray)
       .group(numsports)
       .transitionDuration(100)
       .x(d3.scale.ordinal().domain([(minYear), (maxYear)]))
       .xUnits(dc.units.ordinal)
       .elasticX(true)
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxisLabel("No. Of Sports")
       .yAxis().ticks(5);

   dc.renderAll();
}
