import { computed, inject, InjectionKey, onMounted, onUnmounted, provide, Ref, ref, registerRuntimeCompiler } from 'vue';

const key: InjectionKey<FormContext> = Symbol();

export type Validator<T> = (value?: T) => string | undefined;

export interface FormContext {
  register(name: string, validate: () => void): void;
  deregister(name: string): void;
  updateErrorState(name: string, isInErrorState: boolean): void;
}

export interface FormFieldOptions<T> {
  defaultValue?: T;
  required?: boolean;
  validators?: Validator<T>[];
}

export function useFormContainer() {
  const totalErrors = ref(0);
  const validators: { [name: string]: () => void } = {};
  const errorStates: { [name: string]: boolean } = {};
  const formContext: FormContext = {
    register(name: string, validate: () => void): void {
      validators[name] = validate;
      errorStates[name] = false;
    },
    deregister(name: string) {
      delete validators[name];
      delete errorStates[name];
    },
    updateErrorState(name: string, isInErrorState: boolean) {
      if (errorStates[name] !== isInErrorState) {
        errorStates[name] = isInErrorState;
        totalErrors.value += (isInErrorState ? 1 : -1);
      }
    },
  };
  provide(key, formContext);

  return {
    totalErrors,
    validateForm() {
      for (const name in validators) {
        validators[name]();
      }
    },
  };
}

export function validate<T>(value: T, required: boolean, validators: Validator<T>[] = []) {
  const errors: string[] = [];
  if (required && (
    value === undefined
    || value === null
    || value as unknown as string === '')
  ) {
    errors.push('This field is required');
  } else if ( validators.length > 0) {
    for (const v of validators) {
      const error = v(value);
      if (error) {
        errors.push(error);
      }
    }
  }
  return errors;
}

export function useFormField(name: string, validate: () => string[]) {
  const formContext = inject(key);
  if (!formContext) {
    throw new Error('Form validation used outside a form');
  }
  const errorMessages = ref<string[]>([]);
  const hasBeenValidated = ref(false);

  function validator() {
    const errors = validate();
    hasBeenValidated.value = true;
    errorMessages.value = errors;
    formContext.updateErrorState(name, errors.length === 0);
  }

  onMounted(() => {
    formContext.register(name, validator);
  });
  onUnmounted(() => {
    formContext.deregister(name);
  });
  return {
    errorMessages,
    hasBeenValidated,
    isInErrorState: computed(() => errorMessages.value.length === 0),
    validator,
  };
}
