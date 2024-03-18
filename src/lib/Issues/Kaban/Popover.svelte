<script>
    let visible = false;
  
    // Function to toggle the visibility of the popover
    function togglePopover() {
      visible = !visible;
    }
  
    // Example actions for the buttons
    function actionOne() {
      alert('Performed action one');
    }
  
    function actionTwo() {
      alert('Performed action two');
    }
  
    function actionThree() {
      alert('Performed action three');
    }
  </script>
  
  <style>
    .popover {
      display: none;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      position: absolute;
      background-color: white;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 1;
    }
  
    .popover.visible {
      display: block;
    }
  </style>
  
  <button on:click={togglePopover}>Click Me</button>
  
  <div class="popover {visible ? 'visible' : ''}">
    <button on:click={actionOne}>Action 1</button>
    <button on:click={actionTwo}>Action 2</button>
    <button on:click={actionThree}>Action 3</button>
  </div>