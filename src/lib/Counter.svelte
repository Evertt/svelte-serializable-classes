<script lang="ts">
  import { Counter } from "./counter"

  export let counter = new Counter()
  const count = counter.count
</script>

<button on:click={() => counter.increment()}>
  count is {$count}
</button>
