<script lang="ts">
  import { SerializedData, unserialize } from "../serializable"

  export let serializedData: SerializedData[] = []

  $: unserializedData = Promise.all(serializedData.map(
    item => unserialize(item)
  ))
</script>

<slot {unserializedData} />
