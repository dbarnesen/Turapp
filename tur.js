document.addEventListener("DOMContentLoaded", function () {
  // Mapbox access token
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZGJhcm5lc2VuIiwiYSI6IjFWeUJFNFUifQ.CF2Du3MPcaCQhBBNJSQMDQ";

  // Define custom marker icons
            var unselectedMarkerIcon = "https://uploads-ssl.webflow.com/5a12777c9048ed000106553e/65f40a4f33d817767e6e242e_marker_blue.svg";
            var selectedMarkerIcon = "https://uploads-ssl.webflow.com/5a12777c9048ed000106553e/65f40a4f0116312d1320e108_marker_okre.svg";

            // Initialize map
            var map = new mapboxgl.Map({
                container: "turmap",
                style: "mapbox://styles/dbarnesen/ckk3vfvbi4t1v17p82fuy61pt",
                center: [8.2961, 59.91639], // Default center (Torvet, Risør)
                zoom: 5.5,
                pitch: 54,
            });

            // Add Navigation Control for zooming and rotating the map
            map.addControl(new mapboxgl.NavigationControl(), "top-right");

            // Add Scale Control to show map scale
            map.addControl(
                new mapboxgl.ScaleControl({
                    maxWidth: 80,
                    unit: "metric",
                }),
            );

            // Add Geolocate Control to show user's location and center map when tapped
            var geolocate = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserLocation: true,
                showUserHeading: true, // Display user heading (orientation)
            });

            // Add event listener to the button to trigger geolocation
            document.getElementById("geolocateButton").addEventListener("click", function () {
                // Trigger the Geolocate Control to start tracking the user's location
                geolocate.trigger();
            });

            // Add event listener when map is fully loaded
            map.on("load", function () {
                // Add Geolocate Control to the map
                map.addControl(geolocate);
            });

            // Add markers for all collection items
            var collectionItems = document.querySelectorAll(".tur-collection-item");
            var markers = [];
            var selectedCollectionItem = null;

            collectionItems.forEach(function (item, index) {
                var latitude = parseFloat(item.getAttribute("data-lat"));
                var longitude = parseFloat(item.getAttribute("data-lng"));

                // Retrieve the Kategori value from the Webflow CMS field
                var kategori = item.getAttribute("data-kategori");

                // Check if latitude, longitude, and kategori are valid
                if (!isNaN(latitude) && !isNaN(longitude) && kategori) {
                    var marker = new mapboxgl.Marker({
                        element: createCustomMarkerElement(unselectedMarkerIcon), // Create custom marker element
                        anchor: "bottom", // Anchor marker at the bottom
                    })
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                    // Add data-kategori attribute to the marker element
                    marker.getElement().setAttribute("data-kategori", kategori);

                    markers.push(marker);

                    // Add click event listener to each collection list item
                    item.addEventListener("click", function () {
                        // Zoom to the clicked marker location
                        map.flyTo({
                            center: [longitude, latitude],
                            zoom: 16, // Adjust zoom level as needed
                            essential: true, // Set essential to true for a smooth animation
                        });

                        // Scroll to the selected collection item
                        scrollToSelectedItem(this);

                        // Toggle marker icon
                        toggleMarkerIcon(index);

                        // Apply styling changes to the collection item
                        applySelectionStyling(item);
                    });

                    // Add click event listener to each marker
                    marker.getElement().addEventListener("click", function () {
                        // Scroll to the selected collection item
                        scrollToSelectedItem(item);

                        // Toggle marker icon
                        toggleMarkerIcon(index);

                        // Apply styling changes to the collection item
                        applySelectionStyling(item);

                        // Simulate a click on the corresponding collection item
                        item.click();

                        // Apply the "Pop" interaction to the marker element
                        this.classList.add("pop-interaction");
                    });

                    // Add popup to the marker for walking directions
                    var popup = new mapboxgl.Popup({ offset: 25 }).setText("Click for walking directions");
                    marker.setPopup(popup);

                    // Add click event listener for the popup
                    marker.getElement().addEventListener("click", function () {
                        // Retrieve the coordinates of the marker
                        var coordinates = marker.getLngLat();

                        // Display walking directions
                        showWalkingDirections(coordinates);
                    });
                }
            });

            // Function to create custom marker element
            function createCustomMarkerElement(iconUrl) {
                var markerElement = document.createElement("div");
                markerElement.className = "custom-marker";
                markerElement.style.backgroundImage = "url(" + iconUrl + ")";
                markerElement.style.width = "40px"; // Adjust marker width
                markerElement.style.height = "50px"; // Adjust marker height
                markerElement.style.backgroundSize = "cover"; // Ensure marker image covers the marker element

                return markerElement;
            }
                  // Function to toggle marker icon
    function toggleMarkerIcon(selectedIndex) {
        markers.forEach(function (marker, index) {
            var iconUrl =
                index === selectedIndex ? selectedMarkerIcon : unselectedMarkerIcon;
            marker.getElement().style.backgroundImage = "url(" + iconUrl + ")";
        });
    }

    // Function to scroll the collection list container to show the selected item
    function scrollToSelectedItem(item) {
        var container = document.getElementById("map-slides");
        item.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }

    // Function to apply selection styling to the collection item
    function applySelectionStyling(item) {
        if (selectedCollectionItem) {
            selectedCollectionItem.style.borderColor = ""; // Revert border color of previously selected item
            selectedCollectionItem.style.backgroundColor = ""; // Revert border color of previously selected item
        }
        item.style.borderColor = "#cc9752"; // Apply border color to the selected item
        item.style.backgroundColor = "#cc9752"; // Apply background color to the selected item
        selectedCollectionItem = item; // Update selected collection item
    }

    // Variable to store the currently opened content
    var currentContent = null;

    // Get all item summaries
    var itemSummaries = document.querySelectorAll(".tur-collection-item");

    // Add click event listener to each item summary
    itemSummaries.forEach(function (summary) {
        summary.addEventListener("click", function () {
            // Check if the clicked item is already selected
            if (this === currentContent) {
                return; // Ignore the click event
            }

            // Get the data-item-id attribute value
            var itemId = this.getAttribute("data-item-id");

            // Find the corresponding item detail
            var itemDetail = document.querySelector(
                '.tur-content-reveal[data-content-id="' + itemId + '"]'
            );

            // Check if the item detail exists
            if (itemDetail) {
                // Check if there's currently opened content
                if (currentContent) {
                    // Simulate click to hide the currently opened content
                    currentContent.click();
                }

                // Simulate click to reveal the new content
                itemDetail.click();

                // Update the currently opened content
                currentContent = itemDetail;
            }
        });
    });

    // Add click event listeners to all showMapButton elements
    var showMapButtons = document.querySelectorAll(".showmapbutton");
    showMapButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Retrieve the data-kategori attribute value
            var filterValue = this.getAttribute("data-kategori");

            // Filter collection items and markers based on the data-kategori attribute value
            filterCollectionItems(filterValue);
            filterMarkers(filterValue);
        });
    });

    // Function to filter collection items based on the data-tur-kat attribute value
    function filterCollectionItems(filterValue) {
        var collectionItems = document.querySelectorAll(".tur-collection-item");
        collectionItems.forEach(function (item) {
            var kategori = item.getAttribute("data-kategori");
            if (kategori !== filterValue) {
                item.style.display = "none"; // Hide items not matching the filter value
            } else {
                item.style.display = "block"; // Show items matching the filter value
            }
        });
    }

    function filterMarkers(filterValue) {
        markers.forEach(function (marker) {
            var kategori = marker.getElement().getAttribute("data-kategori");

            if (kategori !== filterValue) {
                console.log("Removing marker");
                marker.remove(); // Remove markers not matching the filter value
            } else {
                console.log("Adding marker");
                marker.addTo(map); // Add markers matching the filter value
            }
        });
    }

    // Function to show walking directions
    function showWalkingDirections(destination) {
        // Retrieve user's current location
        navigator.geolocation.getCurrentPosition(function (position) {
            var origin = [position.coords.longitude, position.coords.latitude];

            // Request walking directions from Mapbox Directions API
            fetch(
                "https://api.mapbox.com/directions/v5/mapbox/walking/" + origin[0] + "," + origin[1] +
                ";" + destination.lng + "," + destination.lat +
                "?steps=true&geometries=geojson&access_token=" + mapboxgl.accessToken
            )
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var route = data.routes[0];
                    var routeGeoJSON = {
                        type: "Feature",
                        properties: {},
                        geometry: route.geometry,
                    };

                    // If the route is already displayed, remove it
                    if (map.getSource("route")) {
                        map.removeLayer("route");
                        map.removeSource("route");
                    } else {
                        // Add route to the map
                        map.addLayer({
                            id: "route",
                            type: "line",
                            source: {
                                type: "geojson",
                                data: routeGeoJSON,
                            },
                            layout: {
                                "line-join": "round",
                                "line-cap": "round",
                            },
                            paint: {
                                "line-color": "#007cbf",
                                "line-width": 8,
                                "line-opacity": 0.8,
                            },
                        });

                        // Fit the map to the route
                        var bounds = route.geometry.coordinates.reduce(function (bounds, coord) {
                            return bounds.extend(coord);
                        }, new mapboxgl.LngLatBounds(route.geometry.coordinates[0], route.geometry.coordinates[0]));

                        map.fitBounds(bounds, {
                            padding: 50,
                        });
                    }
                })
                .catch(function (error) {
                    console.error("Error:", error);
                });
        });
    }
});
