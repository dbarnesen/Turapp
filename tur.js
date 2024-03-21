<script>
document.addEventListener("DOMContentLoaded", function () {
  // Mapbox access token
  mapboxgl.accessToken = "pk.eyJ1IjoiZGJhcm5lc2VuIiwiYSI6IjFWeUJFNFUifQ.CF2Du3MPcaCQhBBNJSQMDQ";

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
  map.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: "metric" }));

  // Add Geolocate Control to show user's location and center map when tapped
  var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserLocation: true,
    showUserHeading: true, // Display user heading (orientation)
  });

  // Add event listener when map is fully loaded
  map.on("load", function () {
    // Add Geolocate Control to the map
    map.addControl(geolocate);
  });

  // Array to store all markers
  var markers = [];

  // Add markers for all collection items
  var collectionItems = document.querySelectorAll(".tur-collection-item");
  collectionItems.forEach(function (item, index) {
    var latitude = parseFloat(item.getAttribute("data-lat"));
    var longitude = parseFloat(item.getAttribute("data-lng"));
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
    item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  // Function to apply selection styling to the collection item
  function applySelectionStyling(item) {
    var selectedCollectionItem = document.querySelector(".tur-collection-item.selected");
    if (selectedCollectionItem) selectedCollectionItem.classList.remove("selected");
    item.classList.add("selected");
  }

  // Function to fit the map view to the bounding box of filtered markers
  function fitToBounds() {
    var filteredMarkersCoordinates = markers.filter(function (marker) {
      return marker.getElement().style.display !== "none";
    }).map(function (marker) {
      return marker.getLngLat().toArray();
    });

    var bounds = filteredMarkersCoordinates.reduce(function (bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(filteredMarkersCoordinates[0], filteredMarkersCoordinates[0]));

    map.fitBounds(bounds, { padding: 50, linear: true, maxZoom: 16 });
  }
  // Add click event listeners to all showMapButton elements
  var showMapButtons = document.querySelectorAll(".showmapbutton");
  showMapButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Retrieve the data-kategori attribute value
      var filterValue = this.getAttribute("data-kategori");

      // Filter collection items and markers based on the data-kategori attribute value
      filterCollectionItems(filterValue);
      filterMarkers(filterValue);

      // Fit the map view to the bounding box of filtered markers
      fitToBounds();
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

  // Function to filter markers based on the data-kategori attribute value
  function filterMarkers(filterValue) {
    markers.forEach(function (marker) {
      var kategori = marker.getElement().getAttribute("data-kategori");

      if (kategori !== filterValue) {
        marker.getElement().style.display = "none"; // Hide markers not matching the filter value
      } else {
        marker.getElement().style.display = "block"; // Show markers matching the filter value
      }
    });
  }
});
