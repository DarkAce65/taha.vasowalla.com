"use strict";

var errorMessage;
var solveFor;
var validInputs = 0;
var periodicTable;
var formulaData = [];
var invalidElements = [];
var deltat = true;

$.getJSON("PeriodicTable.json", function(json) {
	periodicTable = json.periodictable;
});

function tToggle() { // Temperature toggle switch
	$(".tToggle").toggleClass("hidden");
	$("#deltaT").val("");
	$("#Tf").val("");
	$("#Ti").val("");
	deltat = !deltat;
	if(deltat) {
		katex.render("\\displaystyle Q = mC_p\\Delta T", document.querySelector("#shEquation"));
	}
	else {
		katex.render("\\displaystyle Q = mC_p\\left(T_f - T_i\\right)", document.querySelector("#shEquation"));
	}
}

function getElementInfo(symbol) {
	var elementInfo = {};
	for(var i = 0; i < periodicTable.length; i++) { // Search periodic table for element by symbol
		if(periodicTable[i].small == symbol) {
			elementInfo = periodicTable[i];
			return elementInfo;
		}
	}

	return false;
}

function checkFormula(formula) { // Formula validation
	invalidElements = [];
	errorMessage = "Error.";
	if(formula.match(/([0-9\(\)][a-z]+|^[a-z0-9\)])/g) !== null) {
		errorMessage = "Error in formula.";
		return false; // Formula error
	}

	if(isNaN(formula.match(/(\(|\))/g))) {
		if(formula.match(/(\(|\))/g).length % 2 !== 0) {
			errorMessage = "Unclosed parenthesis.";
			return false; // Unclosed parenthesis
		}
	}

	$.each(formula.match(/([A-Z][a-z]*)/g), function(index, value) { // Find invalid Element symbols
		var element = getElementInfo(value);
		if(!element) {
			invalidElements.push(value);
		}
	});

	if(invalidElements.length === 0) { // No invalid elements
		$(".alert").alert("close");
		return true; // Valid formula
	}
	else if(invalidElements.length == 1) { // One invalid element
		errorMessage = invalidElements.join(", ") + " is not an element.";
	}
	else if(invalidElements.length > 1) { // More than one invalid element
		errorMessage = invalidElements.slice(0, -1).join(", ") + " and " + invalidElements[invalidElements.length - 1] + " are not elements.";
	}

	return false; // Default case
}

function molarMass(formula) {
	/* Pair each element symbol with an number */
	$.each(formula.match(/([A-Z\(\)][^A-Z\(\)]*)/g), function(index, value) {
		var output = value.match(/(\d+|[^\d]+)/g);
		if(output[0] != "(" && isNaN(output[1])) {
			output[1] = 1;
		}
		else if(output[1]) {
			output[1] = parseInt(output[1], 10);
		}
		$.merge(formulaData, output);
	});
	katex.render("\\displaystyle " + formula.replace(/\(/g, " \\left(").replace(/\)/g, " \\right)").replace(/(\d+)/g, "_{$1}"), document.querySelector("#formulaTex"));

	/* Evaluate parenthesis */
	var lastIndex = 0;
	while(lastIndex != -1) {
		lastIndex = formulaData.lastIndexOf("(", formulaData.indexOf(")"));
		if(lastIndex == -1) {break;}
		$.each(formulaData.slice(lastIndex, formulaData.indexOf(")")), function(index, value) {
			if(typeof(value) == "number") {
				formulaData[index + lastIndex] = value * formulaData[formulaData.indexOf(")") + 1];
			}
		});
		formulaData.splice(formulaData.indexOf(")") + 1, 1);
		formulaData.splice(formulaData.indexOf(")"), 1);
		formulaData.splice(lastIndex, 1);
	}

	/* Combine duplicates */
	for(var i = 0; i < formulaData.length; i = i + 2) {
		lastIndex = formulaData.lastIndexOf(formulaData[i]);
		while(formulaData.indexOf(formulaData[i]) != lastIndex) {
			lastIndex = formulaData.lastIndexOf(formulaData[i]);
			if(formulaData.indexOf(formulaData[i]) == lastIndex){break;}
			formulaData[i + 1] = formulaData[i + 1] + formulaData[lastIndex + 1];
			formulaData.splice(lastIndex, 2);
		}
	}

	/* Output to table */
	$("#molarMassOutput").html("");
	var output = [];
	var totalAtoms = 0;
	var totalMass = 0;
	for(var i = 0; i < formulaData.length; i = i + 2) { // Calculate total molar mass
		var e = getElementInfo(formulaData[i]);
		var formulaEl = {
			name: e.name,
			atoms: formulaData[i + 1],
			molar: e.molar
		};
		output.push(formulaEl);
		totalAtoms += formulaEl.atoms;
		totalMass += formulaData[i + 1] * e.molar;
	}

	for(var i = 0; i < output.length; i++) { // Output element information
		getElementInfo(formulaData[i]);
		var e = output[i];
		var percent = 100 * e.molar * e.atoms / totalMass;
		$("#molarMassOutput").append("<tr><td>" + e.name + "<br><small>" + e.molar.toFixed(4) + "</small></td><td>" + e.atoms + "</td><td>" + (e.atoms * e.molar).toFixed(4) + "</td><td>" + percent.toFixed(4) + "%</td></tr>");
	}

	$("#totalAtoms").html(totalAtoms);
	$("#totalMolarMass").html(totalMass.toFixed(4));
}

var toSIUnits = {
	atm: function(value) {
		return parseFloat(value);
	},
	mmHg: function(value) {
		return parseFloat(value) / 760;
	},
	Pa: function(value) {
		return parseFloat(value) / 101325;
	},
	kPa: function(value) {
		return parseFloat(value) / 101.325;
	},
	torr: function(value) {
		return parseFloat(value) / 760;
	},
	L: function(value) {
		return parseFloat(value);
	},
	mL: function(value) {
		return parseFloat(value) / 1000;
	},
	m3: function(value) {
		return parseFloat(value) * 1000;
	},
	cm3: function(value) {
		return parseFloat(value) / 1000;
	},
	mol: function(value) {
		return parseFloat(value);
	},
	mmol: function(value) {
		return parseFloat(value) / 1000;
	},
	K: function(value) {
		return parseFloat(value);
	},
	C: function(value) {
		return parseFloat(value) + 273;
	},
	F: function(value) {
		return (parseFloat(value) - 32) * 5 / 9 + 273;
	},
	M: function(value) {
		return parseFloat(value);
	},
	mM: function(value) {
		return parseFloat(value) / 1000;
	},
	J: function(value) {
		return parseFloat(value);
	},
	cal: function(value) {
		return parseFloat(value) / 4.184;
	},
	g: function(value) {
		return parseFloat(value);
	},
	kg: function(value) {
		return parseFloat(value) * 1000;
	},
	JgK: function(value) {
		return parseFloat(value);
	},
	JkgK: function(value) {
		return parseFloat(value) / 1000;
	},
	JgC: function(value) {
		return parseFloat(value);
	},
	JkgC: function(value) {
		return parseFloat(value) / 1000;
	}
};

var fromSIUnits = {
	atm: function(value) {
		return parseFloat(value);
	},
	mmHg: function(value) {
		return parseFloat(value) * 760;
	},
	Pa: function(value) {
		return parseFloat(value) * 101325;
	},
	kPa: function(value) {
		return parseFloat(value) * 101.325;
	},
	torr: function(value) {
		return parseFloat(value) * 760;
	},
	L: function(value) {
		return parseFloat(value);
	},
	mL: function(value) {
		return parseFloat(value) * 1000;
	},
	m3: function(value) {
		return parseFloat(value) / 1000;
	},
	cm3: function(value) {
		return parseFloat(value) * 1000;
	},
	mol: function(value) {
		return parseFloat(value);
	},
	mmol: function(value) {
		return parseFloat(value) * 1000;
	},
	K: function(value) {
		return parseFloat(value);
	},
	C: function(value) {
		return parseFloat(value) - 273;
	},
	F: function(value) {
		return (parseFloat(value) - 273) * 9 / 5 + 32;
	},
	M: function(value) {
		return parseFloat(value);
	},
	mM: function(value) {
		return parseFloat(value) * 1000;
	},
	J: function(value) {
		return parseFloat(value);
	},
	cal: function(value) {
		return parseFloat(value) * 4.184;
	},
	g: function(value) {
		return parseFloat(value);
	},
	kg: function(value) {
		return parseFloat(value) / 1000;
	},
	JgK: function(value) {
		return parseFloat(value);
	},
	JkgK: function(value) {
		return parseFloat(value) * 1000;
	},
	JgC: function(value) {
		return parseFloat(value);
	},
	JkgC: function(value) {
		return parseFloat(value) * 1000;
	}
};

$(document).ready(function() {
	/* Specific Heat */
	$("#specificHeat .calculate").click(function() {
		errorMessage = "Error.";
		solveFor = "";
		validInputs = 0;
		var HCValues = [];
		$.each($("#specificHeat .inputs div:not(.hidden) input"), function(index, value) { // Get valid inputs and store them in HCValues
			var units = $("#" + $(value).attr("id") + "units").val();
			if($(value).val()) {
				validInputs++;
				HCValues[index] = toSIUnits[units]($(value).val());
			}
			else {
				solveFor = $(value);
			}
		});
		if((validInputs == 3 && deltat) || (validInputs == 4 && !deltat)) { // 3 Valid inputs for deltat or 4 valid inputs for tfti
			$(".alert").alert("close");
			var unitId = "#" + solveFor.attr("id") + "units";
			switch(solveFor.attr("id")) { // Equation solving
				case "Q":
					if(HCValues[4]) {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[1] * HCValues[2] * (HCValues[3] - HCValues[4])).toFixed(4));}
					else {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[1] * HCValues[2] * HCValues[3]).toFixed(4));}
					break;
				case "m":
					if(HCValues[4]) {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[2] / (HCValues[3] - HCValues[4])).toFixed(4));}
					else {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[2] / HCValues[3]).toFixed(4));}
					break;
				case "Cp":
					if(HCValues[4]) {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[1] / (HCValues[3] - HCValues[4])).toFixed(4));}
					else {solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[1] / HCValues[3]).toFixed(4));}
					break;
				case "deltaT":
					solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[1] / HCValues[2]).toFixed(4));
					break;
				case "Tf":
					solveFor.val(fromSIUnits[$(unitId).val()](HCValues[0] / HCValues[1] / HCValues[2] + HCValues[4]).toFixed(4));
					break;
				case "Ti":
					solveFor.val(fromSIUnits[$(unitId).val()](HCValues[3] - HCValues[0] / HCValues[1] / HCValues[2]).toFixed(4));
					break;
				default:
					swal({
						title: "Error!",
						text: errorMessage,
						type: "error",
						confirmButtonClass: "btn-danger",
						confirmButtonText: "OK"
					});
					break;
			}
		}
		else {
			if(validInputs <= 3) {errorMessage = "Too many unknowns.";}
			else {errorMessage = "Leave one value blank."}
			$(".alert").alert("close");
			swal({
				title: "Error!",
				text: errorMessage,
				type: "error",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "OK"
			});
		}
	});

	$("#specificHeat .clearInputs").click(function() { // Reset all values
		$("#Q").val("");
		$("#m").val("");
		$("#Cp").val("");
		$("#deltaT").val("");
		$("#Tf").val("");
		$("#Ti").val("");
		$(".alert").alert("close");
	});

	/* Ideal Gas Law */
	$("#idealGasLaw .calculate").click(function() {
		errorMessage = "Error.";
		solveFor = "";
		validInputs = 0;
		var IGLValues = [[], []];
		$.each($("#idealGasLaw .inputs input"), function(index, value) { // Get valid inputs and store them in IGLValues
			if($(value).val()) {
				validInputs++;
				IGLValues[Math.floor(index / 2)].push(toSIUnits[$("#" + $(value).attr("id") + "units").val()]($(value).val()));
			}
			else {
				solveFor = $(value);
				IGLValues[Math.floor(index / 2)].push("1");
			}
		});
		if(validInputs == 3) { // 3 Valid inputs
			$(".alert").alert("close");
			var unitId = "#" + solveFor.attr("id") + "units";
			IGLValues[0] = IGLValues[0][0] * IGLValues[0][1];
			IGLValues[1] = IGLValues[1][0] * 0.0821 * IGLValues[1][1];
			if(solveFor.attr("id") == "P" || solveFor.attr("id") == "V") {
				solveFor.val(fromSIUnits[$(unitId).val()](IGLValues[1] / IGLValues[0]).toFixed(4));
			}
			else {solveFor.val(fromSIUnits[$(unitId).val()](IGLValues[0] / IGLValues[1]).toFixed(4));}
		}
		else {
			if(validInputs <= 3) {errorMessage = "Too many unknowns.";}
			else {errorMessage = "Leave one value blank."}
			$(".alert").alert("close");
			swal({
				title: "Error!",
				text: errorMessage,
				type: "error",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "OK"
			});
		}
	});

	$("#idealGasLaw .clearInputs").click(function() { // Reset all values
		$("#P").val("");
		$("#V").val("");
		$("#n").val("");
		$("#T").val("");
		$(".alert").alert("close");
	});

	/* Dilution */
	$("#dilution .calculate").click(function() {
		errorMessage = "Error.";
		solveFor = "";
		validInputs = 0;
		var dilutionValues = [[], []];
		$.each($("#dilution .inputs input"), function(index, value) {
			if($(value).val()) {
				validInputs++;
				dilutionValues[Math.floor(index / 2)].push(toSIUnits[$("#" + $(value).attr("id") + "units").val()]($(value).val()));
			}
			else {
				solveFor = $(value);
				dilutionValues[Math.floor(index / 2)].push("1");
			}
		});
		if(validInputs == 3) { // 3 Valid inputs
			$(".alert").alert("close");
			var unitId = "#" + solveFor.attr("id") + "units";
			dilutionValues[0] = dilutionValues[0][0] * dilutionValues[0][1];
			dilutionValues[1] = dilutionValues[1][0] * dilutionValues[1][1];
			if(solveFor.attr("id").substr(solveFor.attr("id").length - 1) == 1) {
				solveFor.val(fromSIUnits[$(unitId).val()](dilutionValues[1] / dilutionValues[0]).toFixed(4));
			}
			else {solveFor.val(fromSIUnits[$(unitId).val()](dilutionValues[0] / dilutionValues[1]).toFixed(4));}
		}
		else {
			if(validInputs <= 2) {errorMessage = "Too many unknowns.";}
			else {errorMessage = "Leave one value blank."}
			$(".alert").alert("close");
			swal({
				title: "Error!",
				text: errorMessage,
				type: "error",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "OK"
			});
		}
	});

	$("#dilution .clearInputs").click(function() { // Reset all values
		$("#M1").val("");
		$("#V1").val("");
		$("#M2").val("");
		$("#V2").val("");
		$(".alert").alert("close");
	});

	/* Molar Mass */
	$("#formula").keypress(function(e) {
		if(e.charCode == 13) {
			$("#molarMass .calculate").click();
		}
	});

	$("#molarMass .calculate").click(function() {
		$("#formula").val($("#formula").val().replace(/[^a-zA-Z0-9\(\)]/g, ""));
		var formulaInput = $("#formula").val();
		if(formulaInput) {
			formulaData = [];
			if(checkFormula(formulaInput)) { // Check for valid formula
				molarMass(formulaInput);
			}
			else {
				$(".alert").alert("close");
				swal({
					title: "Error!",
					text: errorMessage,
					type: "error",
					confirmButtonClass: "btn-danger",
					confirmButtonText: "OK"
				});
			}
		}
	});

	$("#molarMass .clearInputs").click(function() { // Reset all values
		$("#molarMassOutput").html("");
		$("#totalAtoms").html("0");
		$("#totalMolarMass").html("0.0000");
		$("#formula").val("");
		$("#formulaTex").html("");
		$(".alert").alert("close");
	});
});