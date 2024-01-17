// Function to remove the blurred-content class from div elements
function removeBlurContentClass(nameOfElement) {
    // Get all div elements with the specified class names
    var divs = document.querySelectorAll(nameOfElement);

    // Loop over the div elements
    divs.forEach(function(div) {
        // Check if the div element is still present in the HTML
        if (document.body.contains(div)) {
            // Remove the blurred-content class from the div element
            div.classList.remove('blurred-content');
            div.classList.remove('blur');
            div.className = '';
        }
    });
}

function removeViewFullExperience(nameOfElement) {
		// Get the div element
		var div = document.querySelector('div.absolute.top-1\\/2.left-0.right-0.m-auto.-translate-y-1\\/2.container-lined.font-sans.text-color-text.text-center.max-w-\\[600px\\].w-3\\/4.pb-3');
			// Remove the class from the div element
			div.classList.remove('absolute');
			div.classList.remove('top-1/2');
			div.classList.remove('left-0');
			div.classList.remove('right-0');
			div.classList.remove('m-auto');
			div.classList.remove('-translate-y-1/2');
			div.classList.remove('container-lined');
			div.classList.remove('font-sans');
			div.classList.remove('text-color-text');
			div.classList.remove('text-center');
			div.classList.remove('max-w-[600px]');
			div.classList.remove('w-3/4');
			div.classList.remove('pb-3');
			};	
			
function replaceStarsWithName(){
	let blurredList = document.querySelectorAll('.blurred-list');
	
	// Should be a function
	blurredList.forEach((list) => {
	  let nestedClasses = list.getElementsByTagName('li');
	  for (let i = 0; i < nestedClasses.length; i++) {
		var logoUrls = nestedClasses[i].getElementsByTagName('img')[0].getAttribute('data-delayed-url');
		const nameOfCompany = logoUrls.substring(logoUrls.lastIndexOf('/') + 1, logoUrls.indexOf('_logo?', logoUrls.lastIndexOf('/') + 1)).replace(/_/g,' ');
		console.log(nameOfCompany);
		
		var divClass = nestedClasses[i].getElementsByClassName("[&>*]:mb-0 text-[18px] text-color-text leading-regular group-hover:underline font-semibold")
		divClass[0].innerHTML = nameOfCompany;
		console.log()
	  }
	});
	
	
	
}

// Create a MutationObserver to detect changes to the page
var observer = new MutationObserver(function(mutations) {
    // Re-run the code to remove the blurred-content class from div elements
    removeBlurContentClass('div.blurred-content.blur');
    //removeViewFullExperience('absolute top-0 left-0 right-0 m-auto -translate-y-1/2 container-lined font-sans text-color-text text-center max-w-[600px] w-3/4 pb-3');
});

// Start observing changes to the page
observer.observe(document.body, {childList: true, subtree: true});

// Run the code to remove the blurred-content class from div elements initially
removeBlurContentClass('div.blurred-content.blur');
removeViewFullExperience('absolute top-0 left-0 right-0 m-auto -translate-y-1/2 container-lined font-sans text-color-text text-center max-w-[600px] w-3/4 pb-3');
replaceStarsWithName();