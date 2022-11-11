<script context="module" lang="ts">
  export { registerClasses } from "../serializable"
</script>

<script lang="ts">
  import { serialize } from "../serializable"

  export let data: { constructor: Function }[] = []
  $: serializedData = data.map(obj => serialize(obj))
</script>

<slot {serializedData} />
