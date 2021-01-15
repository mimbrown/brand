<template>
  <label class="text">
    <input>
    <span class="label-text">{{ label }}<label>
  </label>
  <p class="sublabel"><p>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useFormField, validate, Validator } from "./forms";

export default defineComponent({
  props: {
    modelValue: String,
    name: String,
    label: {
      type: String,
      required: true,
    },
    required: Boolean,
    validators: Array as PropType<Validator<string>[]>,
  },
  setup(props) {
    const {
      errorMessages,
      isInErrorState,
      validator,
    } = useFormField(
      props.name,
      () => validate(props.modelValue, props.required, props.validators),
    );
  },
});
</script>

<style>

</style>