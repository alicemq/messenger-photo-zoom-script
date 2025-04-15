# Messenger.com opened photo zoom and pan

<p>
    This userscript enhances the photo viewing experience in Messenger's modal view (<code>messenger.com</code>)
    by adding advanced photo manipulation tools. It supports zooming with the zoom operation centered at the
    mouse pointer (keeping the point under the cursor fixed) and allows for dragging (panning) the image around.
    A fixed control bar is available at the top of the screen offering manual zoom in, reset, and zoom out options.
  </p>
<img src="https://github.com/user-attachments/assets/e19cd3e8-adcd-4824-ad78-2ffeb062ec5a" width="600">

  
  <h2>Key Features</h2>
  <ul>
    <li><strong>Zoom Under Mouse Pointer:</strong> Use the mouse wheel to zoom in or out.
      The point under your mouse pointer remains fixed as the image scales.</li>
    <li><strong>Drag (Pan) Functionality:</strong> Click and drag the image to reposition it when zoomed in.</li>
    <li><strong>Global Control Bar:</strong> A fixed control bar is displayed at the top center with buttons:
      <code>+</code> (Zoom In), <code>🔍</code> (Reset), and <code>-</code> (Zoom Out).</li>
    <li><strong>HD Image Compatibility:</strong> A high <code>z-index</code> is applied to the image to ensure that it 
      appears above any interfering elements (such as overlays), making it fully visible in HD mode.</li>
    <li><strong>Automatic Reset on Photo Change:</strong> When switching to another photo in the modal, the script resets 
      the zoom level and position to default values, so every new photo starts unzoomed.</li>
  </ul>
  <h2>How It Works</h2>
  <p>
    The script continuously monitors Messenger's DOM for when a modal photo is active—determined by the presence of visible "Next photo" or "Previous photo" buttons.
    Once a modal is active, the script attaches event listeners to the photo element (which is identified by its <code>blob:</code> URL) and:
  </p>
  <ol>
    <li>
      <strong>Zooming:</strong> The mouse wheel event calculates the position of the mouse relative to the image. 
      On zoom in or out, the translation values are updated so that the point under the mouse remains fixed while the image scales.
    </li>
    <li>
      <strong>Dragging:</strong> When you click and hold on the image, it begins tracking your mouse movement.
      The image is repositioned by updating its translation values as you drag, allowing you to pan across the zoomed image.
    </li>
    <li>
      <strong>Global Controls:</strong> The top control bar offers manual buttons for zooming in, resetting the view,
      and zooming out. These controls work on the current modal photo.
    </li>
    <li>
      <strong>Image Priority via Z-Index:</strong> Instead of removing overlay elements through style-based checks,
      the script sets a high <code>z-index</code> on the image. This guarantees that the photo stays on top and visible even if Messenger adds overlays.
    </li>
    <li>
      <strong>Reset on Photo Change:</strong> When a new photo is loaded into the modal, the script resets the zoom scale
      and translation values so that each image starts with a clean, unzoomed view.
    </li>
  </ol>
  <h2>Installation & Usage</h2>
  <ol>
    <li>Install a userscript manager like <a href="https://www.tampermonkey.net/" target="_blank">Tampermonkey</a>.</li>
    <li>Create a new script and paste the provided code.</li>
    <li>Save the script, then visit <a href="https://www.messenger.com/" target="_blank">Messenger.com</a>.</li>
    <li>Open a photo in the modal view. The zoom, drag, and control bar features will become active automatically.</li>
  </ol>
  <h2>Additional Notes</h2>
  <ul>
    <li>The script resets zoom when switching between photos in the modal view.</li>
    <li>If the high <code>z-index</code> method does not work as expected due to future layout changes, check for script updates.</li>
    <li>This version avoids the previous approach of removing overlays via style checks and now solely relies on ensuring image priority.</li>
  </ul>
  <h2>Future Enhancements</h2>
  <ul>
    <li>Integrating multi-touch pinch gestures for mobile devices.</li>
    <li>Adding inertia or easing effects to the drag functionality for smoother panning.</li>
    <li>Implementing additional logic to monitor and reapply transformations if the image element is updated dynamically.</li>
  </ul>
  <p>Enjoy your enhanced Messenger photo viewing experience!</p>
