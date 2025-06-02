import Select from "react-select";

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  return (
    <Select
      value={options.find((opt) => opt.value === value)}
      onChange={(opt) => onChange(opt?.value || "")}
      options={options}
      placeholder={placeholder}
      classNamePrefix="custom-select"
      styles={{
        control: (base) => ({
          ...base,
          cursor: "pointer",
          padding: "6px",
          borderColor: "#D1D5DB",
          borderRadius: "0.375rem",
          boxShadow: "none",
          "&:hover": {
            borderColor: "#60A5FA",
          },
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: 200,
          overflowY: "auto",
        }),
        option: (base, state) => ({
          ...base,
          cursor: "pointer",
          backgroundColor: state.isFocused ? "#DBEAFE" : "white",
          color: "black",
        }),
      }}
    />
  );
};

export default CustomSelect;
