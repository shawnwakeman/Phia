<script>

import { selectedIssues } from "../../stores";

</script>


<button on:click={() => selectedIssues.set([])}>reset</button>
<button>Option 2</button>
<button>Option 3</button>