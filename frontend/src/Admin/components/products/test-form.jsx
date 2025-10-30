import { useEffect } from "react";
import { useForm } from "react-hook-form";

let renderCount = 0;

function TestForm() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      firstName: 'sang',
      email: 'sang',
    },
    mode: 'onBlur',
  });

  console.log(getValues());

  const onSubmit = (data) => {
    console.log(data);
    alert('Form submitted! Check console for data.');
  };

  useEffect(() => { ++renderCount; return () => renderCount = 0 });
  console.log('RENDER: TestForm-' + renderCount);
  return (
    <div className="container">
      <h1>Simple Form with React Hook Form</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            id="firstName"
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && <p className="error">{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default TestForm;