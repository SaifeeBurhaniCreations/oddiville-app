import get from 'lodash/get';
function FormField({ name, form, style, children, }) {
    const value = get(form.values, name);
    const error = form.errors[name];
    return children({
        value,
        onChange: (val) => form.setField(name, val),
        error,
        style,
    });
}
export default FormField;