<template>
  <h1>Hello, World!</h1>

  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur cupiditate maiores enim voluptatum eius, placeat aperiam odit optio, error nemo odio expedita eum quia. Corporis, cum quisquam perferendis sed sunt.</p>
</template>

<script>
import md from "data/test.md";

console.log(md);

export default {
  components: {
  },
  data: () => ({
    md
  })
};
</script>
