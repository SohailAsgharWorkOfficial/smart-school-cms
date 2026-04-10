function FormField({
  label,
  name,
  register,
  errors,
  type = "text",
  options = [],
  placeholder,
  rules,
  rows,
}) {
  const message = errors?.[name]?.message;

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {type === "select" ? (
        <select id={name} {...register(name, rules)}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea id={name} rows={rows ?? 4} placeholder={placeholder} {...register(name, rules)} />
      ) : (
        <input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />
      )}
      {message ? <span className="error-text">{message}</span> : null}
    </div>
  );
}

export default FormField;
