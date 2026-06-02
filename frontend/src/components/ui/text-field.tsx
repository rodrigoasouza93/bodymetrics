interface TextFieldProps {
  readonly autoComplete: string;
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type: "email" | "password" | "text";
}

export function TextField({
  autoComplete,
  label,
  name,
  placeholder,
  type,
}: TextFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-body-strong">
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        className="min-h-11 rounded-md border border-hairline bg-canvas px-4 py-3 text-base text-ink shadow-sm transition placeholder:text-muted focus:border-primary-active"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
