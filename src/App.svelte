<script lang="ts">
  import Server, { registerClasses } from './lib/Server.svelte'
  import Client from './lib/Client.svelte'
  import { Counter } from './lib/counter'
  import CounterComp from './lib/Counter.svelte'

  const registrations = registerClasses({ "lib/counter[Counter]": Counter })
  const counter = new Counter(123)
</script>

<main>
  {#await registrations then}
    <Server data={[counter]} let:serializedData>
      <h2>Counter serialized</h2>
      <pre>{JSON.stringify(serializedData[0], null, 2)}</pre>

      <Client {serializedData} let:unserializedData>
        {#await unserializedData then [newCounter]}
          <h2>Counter unserialized</h2>
          <pre>{(console.log(newCounter), newCounter.toString())}</pre>
          <pre>newCounter instanceof Counter: {newCounter instanceof Counter}</pre>

          <CounterComp counter={newCounter} />
        {/await}
      </Client>
    </Server>
  {/await}
</main>

<style>
  pre {
    text-align: left;
  }
</style>