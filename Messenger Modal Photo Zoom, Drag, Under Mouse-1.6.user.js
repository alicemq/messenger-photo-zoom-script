// ==UserScript==
// @name         Messenger Modal Photo Zoom, Drag, Under Mouse
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Adds zoom support for opened photos on messenger.com
// @match        https://www.messenger.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Global variables to store the current image and its transformation parameters.
    let currentImage = null;
    let currentScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let startTranslateX = 0, startTranslateY = 0;

    // Container for the global control bar that appears at the top of the screen.
    let controlsContainer = null;
    // The zoom step increment (e.g., 0.1 means a 10% change per zoom event).
    const step = 0.1;

    // Function: updateTransform
    // Applies a CSS transform to the current image using both translation and scaling.
    function updateTransform() {
        if (currentImage) {
            currentImage.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px) scale(${currentScale})`;
            // Use the top-left corner as the origin for manual adjustment calculations.
            currentImage.style.transformOrigin = '0 0';
        }
    }

    // Function: createControls
    // Creates a fixed global control bar at the top center of the screen with three buttons:
    // Zoom In ("+"), Reset (magnifier icon), and Zoom Out ("-").
    function createControls() {
        controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.top = '10px';
        controlsContainer.style.left = '50%';
        controlsContainer.style.transform = 'translateX(-50%)';
        controlsContainer.style.zIndex = '10000';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.background = 'rgba(0, 0, 0, 0.5)';
        controlsContainer.style.padding = '5px 10px';
        controlsContainer.style.borderRadius = '5px';

        // Zoom In Button: Increases zoom relative to the image center.
        const zoomInButton = document.createElement('button');
        zoomInButton.innerHTML = '+';
        zoomInButton.style.fontSize = '18px';
        zoomInButton.style.padding = '5px 10px';
        zoomInButton.style.cursor = 'pointer';
        zoomInButton.style.border = 'none';
        zoomInButton.style.background = 'white';
        zoomInButton.style.borderRadius = '3px';
        zoomInButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentImage) {
                const rect = currentImage.getBoundingClientRect();
                // Use the center of the image as a reference.
                const offsetX = rect.width / 2;
                const offsetY = rect.height / 2;
                const zoomFactor = 1 + step;
                // Adjust translation so that the center remains fixed during zoom.
                currentTranslateX += (1 - zoomFactor) * offsetX;
                currentTranslateY += (1 - zoomFactor) * offsetY;
                currentScale *= zoomFactor;
                updateTransform();
            }
        });

        // Reset Button: Resets the zoom level and translation back to default values.
        const resetButton = document.createElement('button');
        resetButton.innerHTML = '🔍';
        resetButton.style.fontSize = '18px';
        resetButton.style.padding = '5px 10px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.border = 'none';
        resetButton.style.background = 'white';
        resetButton.style.borderRadius = '3px';
        resetButton.addEventListener('click', function(e) {
            e.stopPropagation();
            currentScale = 1;
            currentTranslateX = 0;
            currentTranslateY = 0;
            updateTransform();
        });

        // Zoom Out Button: Decreases zoom relative to the image center.
        const zoomOutButton = document.createElement('button');
        zoomOutButton.innerHTML = '-';
        zoomOutButton.style.fontSize = '18px';
        zoomOutButton.style.padding = '5px 10px';
        zoomOutButton.style.cursor = 'pointer';
        zoomOutButton.style.border = 'none';
        zoomOutButton.style.background = 'white';
        zoomOutButton.style.borderRadius = '3px';
        zoomOutButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentImage) {
                const rect = currentImage.getBoundingClientRect();
                const offsetX = rect.width / 2;
                const offsetY = rect.height / 2;
                const zoomFactor = 1 - step;
                currentTranslateX += (1 - zoomFactor) * offsetX;
                currentTranslateY += (1 - zoomFactor) * offsetY;
                currentScale *= zoomFactor;
                updateTransform();
            }
        });

        // Append the buttons to the control bar and add it to the document body.
        controlsContainer.appendChild(zoomInButton);
        controlsContainer.appendChild(resetButton);
        controlsContainer.appendChild(zoomOutButton);
        document.body.appendChild(controlsContainer);
    }

    // Function: removeControls
    // Removes the global control bar from the page.
    function removeControls() {
        if (controlsContainer) {
            controlsContainer.remove();
            controlsContainer = null;
        }
    }

    // Function: isVisible
    // Checks if an element is currently visible (has a non-zero size or visible bounding rectangle).
    function isVisible(el) {
        return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
    }

    // Function: isModalActive
    // Determines if a photo modal is active by checking for visible elements with the aria-labels
    // "Next photo" or "Previous photo". This helps ensure that zoom functionality applies only to modal photos.
    function isModalActive() {
        const next = document.querySelector('[aria-label="Next photo"]');
        const prev = document.querySelector('[aria-label="Previous photo"]');
        return (next && isVisible(next)) || (prev && isVisible(prev));
    }

    // Function: setCurrentImage
    // Sets the current image (must have a blob URL) that will receive zoom and drag functionality.
    // Resets previous transformations and registers event listeners for wheel zoom and dragging.
    function setCurrentImage(img) {
        if (!img.src || !img.src.startsWith('blob:')) return;
        if (!isModalActive()) return;
        currentImage = img;
        // Reset scale and translation.
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateTransform();

        // Ensure that the enhanced events are added only once.
        if (!currentImage.dataset.zoomEnhanced) {
            currentImage.dataset.zoomEnhanced = "true";

            // Mouse wheel zoom: Zooms in or out based on the wheel event, keeping the point under the mouse pointer fixed.
            currentImage.addEventListener('wheel', function(e) {
                e.preventDefault();
                const rect = currentImage.getBoundingClientRect();
                // Calculate the mouse position relative to the image.
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                const zoomFactor = e.deltaY < 0 ? (1 + step) : (1 - step);
                // Adjust translation so that the point under the mouse remains fixed.
                currentTranslateX += (1 - zoomFactor) * offsetX;
                currentTranslateY += (1 - zoomFactor) * offsetY;
                currentScale *= zoomFactor;
                updateTransform();
            }, { passive: false });

            // Drag functionality: Allows the user to drag the image to reposition it.
            currentImage.addEventListener('mousedown', function(e) {
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                startTranslateX = currentTranslateX;
                startTranslateY = currentTranslateY;
                e.preventDefault();
            });
            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                currentTranslateX = startTranslateX + dx;
                currentTranslateY = startTranslateY + dy;
                updateTransform();
            });
            document.addEventListener('mouseup', function() {
                isDragging = false;
            });
        }
    }

    // MutationObserver: Watches for DOM changes to detect when a modal is active and new images are added.
    const observer = new MutationObserver(function(mutations) {
        // If no modal is active, remove controls and clear the current image.
        if (!isModalActive()) {
            removeControls();
            currentImage = null;
            return;
        }
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;
                if (node.tagName.toLowerCase() === 'img') {
                    setCurrentImage(node);
                } else {
                    const imgs = node.querySelectorAll('img');
                    imgs.forEach(function(img) {
                        setCurrentImage(img);
                    });
                }
            });
        });
        // When a modal is active and a current image exists but the control bar is not present, create the controls.
        if (isModalActive() && currentImage && !controlsContainer) {
            createControls();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
