const csv= require('csv-parser')
const fs =  require('fs')

const inputFile = 'Data.csv';
const outputFile = 'volunteer-connection.csv';

const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const csvWriter = createCsvWriter({
    header: ['node1', 'node2', 'weight'],
    path: outputFile
});


// const results = []; // this is for debugging
let common_time = {};// here we'll keep the volunteers with overlapping shifts
// let volunteers = [];//this is for debugging
let weightedGraph = {}; //we'll keep the graph here

fs.createReadStream(inputFile)
.pipe(csv({}))
.on('data',(data) => {

	// results.push(data);
	// volunteers.push(data.volunteerName); //saving all volunteer name to a list

	if (common_time.hasOwnProperty(data.date)){ //if there already exists entry for a date
		if (common_time[data.date].hasOwnProperty(data.shift)){ //if there already exists entry for a date and the shift

			//add to a weighted graph (adjlist) here

			common_time[data.date][data.shift].forEach( 
			//for each of the volunteers that has already existed for a certain date and shift,
			//we'll add a node for the new volunteer
				(volunteer) => {					

					//because a -> b and b -> a are the same we'll count them as one
					//we're arbitrarily choosing lexicographically larger name to be the left hand side "node"
					let fromNode = data.volunteerName, toNode = volunteer; //initializing with the else block value(watch below), reduces redundant code
					if (volunteer > data.volunteerName) {
						fromNode = volunteer;
						toNode = data.volunteerName;
					}
					//here we're keeping the record such that the lexicographically larger name is the fromNode

					// else{
					// 	fromNode = data.volunteerName;
					// 	toNode = volunteer;
					// } 

					if (!weightedGraph.hasOwnProperty(fromNode)){
						weightedGraph[fromNode] = {};
					}
					// if (!weightedGraph.hasOwnProperty(toNode)){
					// 	weightedGraph[toNode] = {};
					// }
					if (!weightedGraph[fromNode].hasOwnProperty(toNode)){
						weightedGraph[fromNode][toNode] = 1;
						// weightedGraph[toNode][fromNode] = 1;						
					}
					else{
						weightedGraph[fromNode][toNode] += 1;
						// weightedGraph[toNode][fromNode] += 1;
					}

				}
			);


			common_time[data.date][data.shift].add(data.volunteerName); // keep the volunteer in proper day and shift
		}

		else{ //if no previous cases of a shift in this day exists, then start a new shift
			common_time[data.date][data.shift] = new Set([data.volunteerName]); // keep the volunteer in proper day and shift
		}
	
	}
	else{ //if no previous cases of same day exists
		common_time[data.date]= {}; //initialize a new object for that date
		common_time[data.date][data.shift] = new Set([data.volunteerName]); // keep the volunteer in proper day and shift
	}

})
.on('end', ()=> {
	const connections = [];

	// update connections to write to csv
	Object.keys(weightedGraph).forEach(
		(fromNode) => {

			Object.keys(weightedGraph[fromNode]).forEach(
				(toNode) => {
					connections.push([fromNode, toNode, weightedGraph[fromNode][toNode]]);
				}
			)
		}
	);


	//write connections to csv
	csvWriter.writeRecords(connections);


	// console.log(results[0]);
	// console.log({volunteers})
	console.log(common_time)
	console.log({weightedGraph})
	// console.log({connections})
});