$(function() {
	var clipText = Snap("#clipText");
	var ftext = clipText.text(10, 75, "Fire").attr({"font-size": "75px", "fill": "white"});
	var wtext = clipText.text(10, 170, "Water").attr({"font-size": "75px", "fill": "white"});
	var etext = clipText.text(390, 75, "Earth").attr({"text-anchor": "end", "font-size": "75px", "fill": "white"});
	var atext = clipText.text(390, 170, "Air").attr({"text-anchor": "end", "font-size": "75px", "fill": "white"});
	clipText.image("elements/Fire.jpg", -70, -50, 400, 275).attr({mask: ftext});
	clipText.image("elements/Water.jpg", 0, -50, 400, 300).attr({mask: wtext});
	clipText.image("elements/Earth.jpg", 0, -50, 400, 225).attr({mask: etext});
	clipText.image("elements/Air.jpg", 75, 35, 400, 235).attr({mask: atext});
	var masking = Snap("#maskImage");
	var apertureMask = masking.path("M320.622,16.038c-48.13-10.56-96.075-6.789-139.409,8.433l205.646,142.285L363.887,29.585  C350.117,23.897,335.676,19.34,320.622,16.038z M381.61,37.721l41.565,244.095l79.798-112.224  C480.031,113.27,437.342,65.91,381.61,37.721z M164.624,30.954C107.809,55.459,60.469,100.197,33.57,158.183l248.56-46.176  L164.624,30.954z M508.526,184.605L367.76,388.57l135.075-25.795c5.425-13.334,9.788-27.293,12.978-41.823l1.161-5.589  C525.838,270.157,522.227,225.371,508.526,184.605z M165.219,149.9L26.793,174.226c-4.543,11.86-8.283,24.22-11.088,37.004  C5.067,259.717,8.992,308.02,24.5,351.609L165.219,149.9z M107.782,257.134L31.555,369.377  c24.248,54.834,67.436,100.631,123.173,127.418L107.782,257.134z M496.049,377.989l-242.225,46.989l111.375,76.992  C421.459,478.19,468.575,434.608,496.049,377.989z M146.782,370.741l23.439,132.869c12.988,5.211,26.556,9.434,40.676,12.53  c47.857,10.5,95.541,6.83,138.681-8.18L146.782,370.741z")
		.attr({"transform": "matrix(0.38,0,0,0.38,100,0)", fill: "white"});
	var image = masking.image("../../img/placeholder/RedFlourish.jpg", 0, 0, 400, 200)
		.attr({mask: apertureMask});
});