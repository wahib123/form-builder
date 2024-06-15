import { Field, Formik } from "formik";
import { useRef, useState } from "react";
import { Badge, Button, Col, Form, Row, Table } from "react-bootstrap";
import * as yup from "yup";

interface FieldConfig {
  type: string;
  name: string;
  id: string;
  label: string;
  placeholder: string;
  validations: Record<string, any>;
  inputValidations: boolean;
  options: { label: string; value: string }[];
}

const FormBuilder = () => {
  const initialFieldConfig = {
    type: "",
    name: "",
    id: "",
    label: "",
    placeholder: "",
    inputValidations: false,
    validations: { required: true, maxLength: "", minLength: "" },
    options: [] as { label: string; value: string }[],
  };

  const formRef = useRef<any>(null);
  console.log("🚀 ~ FormBuilder ~ formRef:", formRef);

  const [formElements, setFormElements] = useState<FieldConfig[]>([]);
  const [option, setOption] = useState({
    label: "",
    value: "",
    error: { label: "", value: "" },
  });

  const [isFormCreated, setIsFormCreated] = useState(false);

  const getFormElementsInitialValue = () => {
    const initialValues = formElements?.reduce((acc, element) => {
      const newObj = { ...acc, [element.name]: "" };
      return newObj;
    }, {});
    return initialValues;
  };

  const FieldConfigSchema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .test("name", "", function (val, config) {
        if (formElements?.findIndex((element) => element?.name === val) > -1) {
          return config.createError({
            ...config,
            message: "Name must be unique",
          });
        }
        return true;
      }),
    type: yup.string().required("Please select type of a input"),
    label: yup.string().required("Please enter label of a input"),
    placeholder: yup.string().typeError("Please enter valid placeholder"),
    inputValidations: yup.boolean(),
    id: yup.string(),
    validations: yup.object().shape({
      required: yup.boolean(),
      maxLength: yup
        .number()
        .typeError("Please enter valid size")
        .test("minLength", "", function (_val, config) {
          const { minLength, maxLength } = this.parent;
          if (minLength > maxLength) {
            return config.createError({
              ...config,
              message: "Max legth must be greater than min length",
            });
          }
          return true;
        }),
      minLength: yup.number().typeError("Please enter valid size"),
    }),
    options: yup.array().when("type", {
      is: (val: string) => {
        return val === "select";
      },
      then: yup
        .array()
        .of(
          yup.object().shape({
            label: yup.string().required("Please ente a label"),
            value: yup.string().required("Please ente a value"),
          })
        )
        .min(1, "Please add atleast one option"),
      otherwise: yup.array(),
    }),
  });

  const renderInputElement = (element: FieldConfig, args: any) => {
    switch (element?.type) {
      case "select":
        return (
          <Form.Group className="mb-3">
            <label>{element?.label}</label>
            <Form.Select
              name={element?.name}
              value={args?.field?.value}
              onChange={args?.form?.handleChange}
            >
              <option value="">Select Placeholder</option>
              {element?.options?.map((option) => (
                <option value={option?.value}>{option?.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case "text":
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element?.label}</Form.Label>
            <Form.Control
              name={element?.name}
              placeholder={element?.placeholder}
              value={args?.field?.value}
              onChange={args?.form?.handleChange}
            />
          </Form.Group>
        );
      case "checkbox":
        return (
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name={`${element?.name}`}
              label={`${element?.label}`}
              checked={args?.field?.value}
              onChange={(e) => {
                args?.form?.setFieldValue(element?.name, e?.target?.checked);
              }}
            />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Row>
        {!isFormCreated ? (
          <Formik
            initialValues={initialFieldConfig}
            onSubmit={(values, { resetForm }) => {
              setFormElements((prev) => [
                ...prev,
                { ...values, id: crypto?.randomUUID() },
              ]);
              resetForm();
            }}
            innerRef={formRef}
            validationSchema={FieldConfigSchema}
          >
            {({ values, errors, touched, handleSubmit, setFieldValue }) => (
              <form onSubmit={handleSubmit}>
                <Col md={{ span: 6, offset: 3 }}>
                  <h4 className="mb-4">Form Builder</h4>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Input Type*</Form.Label>
                    <Form.Select
                      name="type"
                      value={values?.type}
                      aria-label="Default select example"
                      onChange={(e) => {
                        setFieldValue("type", e?.target?.value, true);
                        setFieldValue("options", []);
                        // handleChangeConfig(e?.target?.value || "", "type");
                      }}
                    >
                      <option value=""></option>
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                    </Form.Select>
                    {errors.type && touched.type && (
                      <span className="text-danger">{errors.type}</span>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Input Label*</Form.Label>
                    <Form.Control
                      name="label"
                      value={values?.label}
                      placeholder="Enter input label"
                      type="text"
                      onChange={(e) => {
                        setFieldValue("label", e?.target?.value, true);
                      }}
                    />
                    {errors.label && touched.label && (
                      <span className="text-danger">{errors.label}</span>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Input Name*</Form.Label>
                    <Form.Control
                      name="name"
                      value={values?.name}
                      placeholder="Enter input name"
                      type="text"
                      onChange={(e) => {
                        setFieldValue("name", e?.target?.value, true);
                      }}
                    />
                    {errors.name && touched.name && (
                      <span className="text-danger">{errors.name}</span>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Input Placeholder</Form.Label>
                    <Form.Control
                      placeholder="Enter input placeholder"
                      name="placeholder"
                      type="text"
                      value={values?.placeholder}
                      onChange={(e) => {
                        setFieldValue("placeholder", e?.target?.value, true);
                      }}
                    />
                    {errors.placeholder && touched.placeholder && (
                      <span className="text-danger">{errors.placeholder}</span>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Validations</Form.Label>
                    <Form.Check
                      type="switch"
                      id="custom-switch"
                      checked={values?.inputValidations}
                      label="Check this switch to enable validations"
                      onChange={(e) => {
                        setFieldValue(
                          "inputValidations",
                          e?.target?.checked,
                          true
                        );
                        setFieldValue(
                          "validations",
                          {
                            ...values?.validations,
                            required: true,
                          },
                          true
                        );
                      }}
                    />
                  </Form.Group>
                  {values?.inputValidations && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Is requied</Form.Label>
                        <Form.Check
                          type="switch"
                          checked={values?.validations?.required}
                          id="custom-switch-required"
                          label="Check this switch to make input field required"
                          onChange={(e) => {
                            setFieldValue(
                              "validations",
                              {
                                ...values?.validations,
                                required: e?.target?.checked,
                              },
                              true
                            );
                          }}
                        />
                      </Form.Group>
                      {values?.type === "text" && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Max Length</Form.Label>
                            <Form.Control
                              placeholder="Enter max legth"
                              type="number"
                              name={"validations.maxLength"}
                              onChange={(e) => {
                                setFieldValue(
                                  "validations",
                                  {
                                    ...values?.validations,
                                    maxLength: e?.target?.value,
                                  },
                                  true
                                );
                              }}
                            />
                            {errors.validations?.maxLength &&
                              touched.validations?.maxLength && (
                                <span className="text-danger">
                                  {errors.validations?.maxLength}
                                </span>
                              )}
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Min Length</Form.Label>
                            <Form.Control
                              placeholder="Enter max legth"
                              type="number"
                              name={"validations.minLength"}
                              onChange={(e) => {
                                setFieldValue(
                                  "validations",
                                  {
                                    ...values?.validations,
                                    minLength: e?.target?.value,
                                  },
                                  true
                                );
                              }}
                            />
                            {errors.validations?.minLength &&
                              touched.validations?.minLength && (
                                <span className="text-danger">
                                  {errors.validations?.minLength}
                                </span>
                              )}
                          </Form.Group>
                        </>
                      )}
                    </>
                  )}
                  {values?.type === "select" && (
                    <Form.Group className="mb-3">
                      <Row>
                        <Col>
                          <Form.Label>Label of option</Form.Label>
                          <Form.Control
                            type="text"
                            // className="mb-2"
                            value={option?.label}
                            placeholder="Enter label of option"
                            onChange={(e) => {
                              setOption((prev) => ({
                                ...prev,
                                label: e?.target?.value,
                                error: {
                                  ...prev?.error,
                                  label: "",
                                },
                              }));
                            }}
                          />
                          {option?.error?.label && (
                            <span className="text-danger">
                              {option?.error?.label}
                            </span>
                          )}
                        </Col>
                        <Col>
                          <Form.Label>Value of option</Form.Label>
                          <Form.Control
                            type="text"
                            // className="mb-2"
                            value={option?.value}
                            placeholder="Enter value of option"
                            onChange={(e) => {
                              setOption((prev) => ({
                                ...prev,
                                value: e?.target?.value,
                                error: {
                                  ...prev?.error,
                                  value: "",
                                },
                              }));
                            }}
                          />
                          {option?.error?.value && (
                            <span className="text-danger">
                              {option?.error?.value}
                            </span>
                          )}
                        </Col>
                      </Row>

                      {values?.options?.map((option, index) => {
                        return (
                          <Badge
                            className="me-1"
                            key={crypto.randomUUID()}
                            bg="dark"
                          >
                            {`${option?.label}: ${option?.value}`} |{" "}
                            <span
                              className="cursor-pointer"
                              onClick={() => {
                                const options = [...(values?.options || [])];
                                options?.splice(index, 1);
                                setFieldValue("options", options, true);
                              }}
                            >
                              X
                            </span>
                          </Badge>
                        );
                      })}

                      <Button
                        size="sm"
                        className="d-block my-2"
                        onClick={() => {
                          if (!option?.value) {
                            setOption((prev) => ({
                              ...prev,
                              error: {
                                ...prev?.error,
                                value: "Please enter a option value",
                              },
                            }));
                          }
                          if (!option?.label) {
                            setOption((prev) => ({
                              ...prev,
                              error: {
                                ...prev?.error,
                                label: "Please enter a option label",
                              },
                            }));
                          }
                          if (!option?.value || !option?.label) return;
                          if (
                            values?.options?.findIndex(
                              (inputOption) =>
                                inputOption?.value === option?.value
                            ) > -1
                          ) {
                            setOption((prev) => ({
                              ...prev,
                              error: {
                                ...prev?.error,
                                value: "Value must be unique",
                              },
                            }));
                            return;
                          }
                          const options = [...values.options, option];
                          setOption((prev) => ({
                            ...prev,
                            value: "",
                            label: "",
                          }));
                          setFieldValue("options", options, true);
                        }}
                      >
                        Add options
                      </Button>
                      {!values.options?.length && touched.options && (
                        <p className="text-danger">
                          Please add atleast one option
                        </p>
                      )}
                    </Form.Group>
                  )}
                  <Button type="submit">Add Field</Button>
                </Col>
              </form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={getFormElementsInitialValue()}
            onSubmit={(values) => console.log("values", values)}
          >
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                {formElements?.map((element) => (
                  <Field key={element?.name} name={element?.name}>
                    {(args: any) => renderInputElement(element, args)}
                  </Field>
                ))}
                <Button type="submit">Submit</Button>
              </form>
            )}
          </Formik>
        )}
        {formElements?.length && !isFormCreated ? (
          <>
            <h3>Form field</h3>
            <Table className="mt-5" striped>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Label</th>
                  <th>Placeholder</th>
                  <th>Required</th>
                  <th>Max size</th>
                  <th>Min size</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {formElements?.map((element, index) => (
                  <tr key={element?.id}>
                    <td>{index + 1}</td>
                    <td>{element?.type || "-"}</td>
                    <td>{element?.name || "-"}</td>
                    <td>{element?.label || "-"}</td>
                    <td>{element?.placeholder || "-"}</td>
                    <td>
                      {element?.inputValidations &&
                      element?.validations?.required
                        ? "true"
                        : "false"}
                    </td>
                    <td>
                      {element?.inputValidations &&
                      element?.validations?.maxLength
                        ? element?.validations?.maxLength
                        : "-"}
                    </td>
                    <td>
                      {element?.inputValidations &&
                      element?.validations?.minLength
                        ? element?.validations?.minLength
                        : "-"}
                    </td>
                    <td>
                      {element?.options?.length
                        ? element?.options?.map((option, index) => (
                            <Badge
                              key={index}
                            >{`${option?.label}: ${option?.value}`}</Badge>
                          ))
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button
              onClick={() => {
                setIsFormCreated(true);
              }}
            >
              Create Form
            </Button>
          </>
        ) : null}
      </Row>
    </div>
  );
};

export default FormBuilder;
