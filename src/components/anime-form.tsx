import React, { useState, FormEvent, useMemo } from 'react';
import dayjs from 'dayjs';
import Joi, { valid } from 'joi';
import {
  Button,
  TextField,
  Rating,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  IconButton,
  FormHelperText
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Anime, AnimeFields, Subtype, Status } from '@/types/anime-types';
import { Errors, AnimeEditFields } from '@/types/components/anime-form-types';
import utilStyles from '@/styles/utils.module.css';
import animeFormStyles from '@/styles/components/AnimeForm.module.css';
import { StarRate } from '@mui/icons-material';

const END_DATE = 'endDate';
const FORM_VALIDATION_ERROR_MESSAGE =
  'Please correct the highlighted errors before submitting the form.';

export default function AnimeForm({
  submitForm,
  dateFormat = 'YYYY-MM-DD'
}: {
  submitForm: (fields: AnimeFields) => Promise<void>;
  dateFormat?: string;
}) {
  const [fields, setFields] = useState<AnimeEditFields>({
    title: '',
    enTitle: '',
    description: '',
    rating: 10,
    startDate: null,
    endDate: null,
    subtype: Subtype.TV,
    status: Status.FINISHED,
    posterImage: '',
    coverImage: '',
    episodeCount: null,
    categories: ['']
  });
  const [preStartDate, setPreStartDate] = useState(fields.startDate);
  const [errors, setErrors] = useState<Errors>({});
  const isDisabled = Object.keys(errors).length > 0;

  const schema = Joi.object({
    title: Joi.string().trim().max(256).required(),
    enTitle: Joi.string().trim().max(256).allow(null).allow('').required(),
    description: Joi.string().trim().max(2000).required(),
    rating: Joi.when('status', {
      is: Status.UPCOMING,
      then: Joi.valid(null).required(),
      otherwise: Joi.number()
        .min(0)
        .max(10)
        .required()
        .prefs({ convert: false })
    }),
    startDate: Joi.when('status', {
      is: Status.UPCOMING,
      then: Joi.date().iso().greater('now').required(),
      otherwise: Joi.date().iso().min('1900-1-1').max('now').required()
    }),
    endDate: Joi.when('status', {
      is: Status.FINISHED,
      then: Joi.date().iso().min(Joi.ref('startDate')).max('now').required(),
      otherwise: Joi.date()
        .iso()
        .greater('now')
        .min(Joi.ref('startDate'))
        .allow(null)
        .required()
    }),
    subtype: Joi.string()
      .valid(...Object.values(Subtype))
      .required(),
    status: Joi.string()
      .valid(...Object.values(Status))
      .required(),
    posterImage: Joi.string().uri().required(),
    coverImage: Joi.string().uri().allow(null).allow('').required(),
    episodeCount: Joi.when('status', {
      is: Status.FINISHED,
      then: Joi.number().integer().min(1).required().prefs({ convert: false }),
      otherwise: Joi.number()
        .integer()
        .min(1)
        .allow(null)
        .required()
        .prefs({ convert: false })
    }),

    categories: Joi.array()
      .unique()
      .min(1)
      .items(Joi.string().trim().min(1).max(256))
      .required()
  });

  const endDateMin = (): dayjs.Dayjs => {
    if (fields.status === Status.FINISHED) {
      return dayjs(fields.startDate, dateFormat);
    } else {
      return dayjs(fields.startDate, dateFormat).isAfter(dayjs())
        ? dayjs(fields.startDate, dateFormat)
        : dayjs().add(1, 'day');
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (event.target.name === 'episodeCount') {
      setFields({
        ...fields,
        [event.target.name]: !Number.isNaN(parseInt(event.target.value, 10))
          ? parseInt(event.target.value, 10)
          : null
      });
    } else {
      setFields({
        ...fields,
        [event.target.name]: event.target.value
      });
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>): void => {
    const { name, value } = event.target;
    if (name === 'status') {
      if (value === Status.UPCOMING) {
        setFields({
          ...fields,
          [name]: value,
          endDate: null,
          rating: null
        });
        validate(
          {
            [name]: value,
            endDate: null,
            rating: null
          },
          [name, 'startDate', 'endDate', 'episodeCount', 'rating']
        );
      } else if (value === Status.FINISHED || value === Status.CURRENT) {
        setFields({
          ...fields,
          [name]: value
        });
        validate(
          {
            [name]: value
          },
          [name, 'startDate', 'endDate', 'episodeCount', 'rating']
        );
      }
    } else {
      setFields({
        ...fields,
        [name]: value
      });
      validateSingleField(name, value);
    }
  };

  const handleRatingChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: number | null
  ) => {
    setFields({
      ...fields,
      [event.target.name]: value
    });

    validate({ [event.target.name]: value }, [event.target.name]);
  };

  // for all TextFields onBlur: trim the value and validate
  const handleTextFieldBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ): void => {
    const { name, value } = event.target;
    let updatedValue;
    if (name === 'categories' && index != null) {
      updatedValue = [...fields.categories];
      updatedValue[index] = value.trim();
      setFields({
        ...fields,
        [name]: updatedValue
      });
      validateSingleField(name, updatedValue);
    } else if (name === 'episodeCount') {
      validate({ [name]: fields[name] }, [name]);
    } else {
      updatedValue = value.trim();
      setFields({
        ...fields,
        [name]: updatedValue
      });
      validateSingleField(name, updatedValue);
    }
  };

  const handleDateChange = (name: string, value: dayjs.Dayjs | null): void => {
    const updatedDate = !!value ? value.format(dateFormat) : null;
    setFields({
      ...fields,
      [name]: updatedDate
    });
    validate(
      {
        [name]: updatedDate
      },
      name === END_DATE ? [name] : [name, END_DATE]
    );
  };

  const clearDate = (name: string): void => {
    const updatedDate = null;
    setFields({
      ...fields,
      [name]: updatedDate
    });
    validate(
      {
        [name]: updatedDate
      },
      name === END_DATE ? [name] : [name, END_DATE]
    );
  };

  const handleCategoryChange = (
    idx: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const updatedCategories = [...fields.categories];
    updatedCategories[idx] = event.target.value;

    setFields({
      ...fields,
      categories: updatedCategories
    });
  };

  const removeCategory = (idx: number): void => {
    const updatedCategories = [...fields.categories];
    updatedCategories.splice(idx, 1);

    setFields({
      ...fields,
      categories: updatedCategories
    });

    validateSingleField('categories', updatedCategories);
  };

  const addEmptyCategory = (): void => {
    const updatedCategories = [...fields.categories, ''];
    setFields({
      ...fields,
      categories: updatedCategories
    });
    if (updatedCategories.length === 1)
      validateSingleField('categories', updatedCategories);
  };

  const mapJoiErrorToErrors = (error: Joi.ValidationError): Errors => {
    const validationErrors: Errors = {};
    error.details.forEach((detail) => {
      // check if the path has the path[1] index, if yes, add message to the errors[path[0]][path[1]]
      if (detail.path[1] == null) {
        // normal fields, not an array and no path[1] index, directly setup field by path[0] field name (no override)
        if (detail.path[0] !== 'categories') {
          validationErrors[detail.path[0]] =
            validationErrors[detail.path[0]] ?? detail.message;
        } else {
          validationErrors[detail.path[0]] =
            validationErrors[detail.path[0]] == null
              ? { general: detail.message }
              : {
                  general: detail.message,
                  ...validationErrors[detail.path[0]]
                };
        }
      } else if (detail.path[0] === 'categories') {
        validationErrors[detail.path[0]] =
          validationErrors[detail.path[0]] == null
            ? { [detail.path[1]]: detail.message }
            : {
                [detail.path[1]]: detail.message,
                ...validationErrors[detail.path[0]]
              };
      }
    });
    return validationErrors;
  };

  // validate the entire fields
  // with optional key and value object to validate using the real-time field value
  // with optional errorFields to validate the specific fields
  const validate = (
    newFields?: { [key: string]: any },
    errorFields?: string[]
  ): boolean => {
    const targetFields: AnimeEditFields = { ...fields };

    if (!!newFields) {
      Object.keys(newFields).forEach((newFieldKey) => {
        if (
          Object.keys(fields).includes(newFieldKey) &&
          newFields[newFieldKey] !== undefined
        ) {
          targetFields[newFieldKey] = newFields[newFieldKey];
        }
      });
    }

    const { error } = schema.validate(targetFields, { abortEarly: false });
    console.log('entire validation errors', error?.details);

    let validationErrors: Errors = {};
    if (error) {
      // error.details.forEach((detail, index) => {
      //   // check if the path has the path[1] index, if yes, add message to the errors[path[0]][path[1]]
      //   if (detail.path[1] == null) {
      //     // normal fields, not an array and no path[1] index, directly setup field by path[0] field name (no override)
      //     if (detail.path[0] !== 'categories') {
      //       validationErrors[detail.path[0]] =
      //         validationErrors[detail.path[0]] ?? detail.message;
      //     } else {
      //       validationErrors[detail.path[0]] =
      //         validationErrors[detail.path[0]] == null
      //           ? { general: detail.message }
      //           : {
      //               general: detail.message,
      //               ...validationErrors[detail.path[0]]
      //             };
      //     }
      //   } else if (detail.path[0] === 'categories') {
      //     validationErrors[detail.path[0]] =
      //       validationErrors[detail.path[0]] == null
      //         ? { [detail.path[1]]: detail.message }
      //         : {
      //             [detail.path[1]]: detail.message,
      //             ...validationErrors[detail.path[0]]
      //           };
      //   }
      // });
      validationErrors = mapJoiErrorToErrors(error);
    }

    console.log(validationErrors);
    // TODO:
    // 1. check if updateFields is not null, only update the fields specified in the updateFields
    // if name and values are not null, also update the field specified by name
    // 2. if updatedFields conc name is empty, update the entire errors with validationErrors directly

    if (errorFields == null) {
      setErrors(validationErrors);
    } else {
      const updatedErrors = { ...errors };
      errorFields.forEach((errorField) => {
        if (!!validationErrors[errorField]) {
          updatedErrors[errorField] = validationErrors[errorField];
        } else {
          delete updatedErrors[errorField];
        }
      });
      setErrors(updatedErrors);
    }

    return error == null;
  };

  if (
    preStartDate !== fields.startDate &&
    fields.startDate !== null &&
    fields.status === Status.FINISHED
  ) {
    const currentStartDate = fields.startDate;
    setFields({ ...fields, endDate: currentStartDate });
    setPreStartDate(currentStartDate);
    validate({ endDate: currentStartDate }, [END_DATE]);
  }

  const validateSingleField = (name: string, value: any): void => {
    // check if name exists in the fields' keys, and value is not undefined
    if (!Object.keys(fields).includes(name)) return;

    const fieldSchema = Joi.object({ [name]: schema.extract(name) });
    const { error } = fieldSchema.validate(
      { [name]: value },
      { abortEarly: false }
    );
    console.log('validate single field:', error?.details);
    const updatedErrors: Errors = { ...errors };

    if (error) {
      const validationErrors = mapJoiErrorToErrors(error);
      updatedErrors[name] = validationErrors[name];
      setErrors(updatedErrors);
      // const updatedErrors: Errors = {};
      // error.details.forEach((detail, index) => {
      //   // check if the path has the path[1] index, if yes, add message to the errors[path[0]][path[1]]
      //   // if no (normal fields) => not an array and no path[1] index, directly setup field by path[0] field name (no override)
      //   if (detail.path[1] == null) {
      //     if (detail.path[0] !== 'categories') {
      //       updatedErrors[detail.path[0]] =
      //         updatedErrors[detail.path[0]] ?? detail.message;
      //     } else {
      //       updatedErrors[detail.path[0]] =
      //         updatedErrors[detail.path[0]] == null
      //           ? { general: detail.message }
      //           : {
      //               general: detail.message,
      //               ...updatedErrors[detail.path[0]]
      //             };
      //     }
      //   } else if (detail.path[0] === 'categories') {
      //     updatedErrors[detail.path[0]] =
      //       updatedErrors[detail.path[0]] == null
      //         ? { [detail.path[1]]: detail.message }
      //         : {
      //             [detail.path[1]]: detail.message,
      //             ...updatedErrors[detail.path[0]]
      //           };
      //   }
      // });

      // // const validationError = mapJoiErrorToErrors(error);

      // setErrors({
      //   ...errors,
      //   ...updatedErrors
      // });
    } else {
      delete updatedErrors[name];
      setErrors(updatedErrors);
    }
  };

  // TODO: handleSubmit
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      console.log('form-submitted: ', fields);
    } else {
      console.log('some validation errors needs to be resolved');
    }
    // submitForm({
    //   ...fields,
    //   title: fields.title.trim(),
    //   enTitle: !fields.enTitle ? fields.enTitle : fields.enTitle.trim(),
    //   posterImage: fields.posterImage.trim(),
    //   coverImage: !fields.coverImage
    //     ? fields.coverImage
    //     : fields.coverImage.trim(),
    //   description: fields.description.trim()
    // });
  };

  return (
    <form className={animeFormStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={animeFormStyles.fieldsContainer}>
        <TextField
          className={animeFormStyles.titleInput}
          required
          error={!!errors.title}
          id="title-input"
          label="Title"
          name="title"
          value={fields.title ?? ''}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          helperText={errors.title}
        />
        <TextField
          className={animeFormStyles.titleInput}
          error={!!errors.enTitle}
          id="en-title-input"
          label="English Title"
          name="enTitle"
          value={fields.enTitle ?? ''}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          helperText={errors.enTitle}
        />
      </div>
      <div className={animeFormStyles.fieldsContainer}>
        <FormControl
          className={animeFormStyles.selectContainer}
          error={!!errors.subtype}
        >
          <InputLabel id="subtype-label">Type *</InputLabel>
          <Select
            required
            labelId="subtype-label"
            id="subtype"
            name="subtype"
            value={fields.subtype}
            label="Subtype *"
            onChange={(event) => {
              handleSelectChange(event);
            }}
          >
            {Object.values(Subtype).map((subtype, index) => (
              <MenuItem key={index} value={subtype}>
                {subtype}
              </MenuItem>
            ))}
          </Select>
          {!!errors.subtype && (
            <FormHelperText>{errors.subtype}</FormHelperText>
          )}
        </FormControl>
        <FormControl
          className={animeFormStyles.selectContainer}
          error={!!errors.status}
        >
          <InputLabel id="status-label">Status *</InputLabel>
          <Select
            required
            labelId="status-label"
            id="status"
            name="status"
            value={fields.status}
            label="Status *"
            onChange={(event) => {
              handleSelectChange(event);
            }}
          >
            {Object.values(Status).map((status, index) => (
              <MenuItem key={index} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          {!!errors.status && <FormHelperText>{errors.status}</FormHelperText>}
        </FormControl>
        <TextField
          id="episode-count-input"
          label="Episode Count"
          name="episodeCount"
          type="number"
          className={animeFormStyles.episodeCountInput}
          error={!!errors.episodeCount}
          value={fields.episodeCount ?? 'NaN'}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          helperText={errors.episodeCount}
        />
      </div>
      <div className={animeFormStyles.fieldsContainer}>
        <span
          className={
            !!errors.rating
              ? animeFormStyles.alertColor
              : animeFormStyles.inputColor
          }
        >
          Rating*:{' '}
        </span>
        {fields.rating && (
          <span className={animeFormStyles.ratingNumber}>{fields.rating}</span>
        )}
        <Rating
          name="rating"
          value={fields.rating}
          onChange={handleRatingChange}
          disabled={fields.status === Status.UPCOMING}
          size="large"
          max={10}
          precision={0.5}
        />
        {errors.rating && (
          <span className={animeFormStyles.alertMessage}>{errors.rating}</span>
        )}
      </div>

      <div className={animeFormStyles.fieldsContainer}>
        <DatePicker
          label="Start Date *"
          value={fields.startDate ? dayjs(fields.startDate, dateFormat) : null}
          minDate={
            fields.status === Status.UPCOMING
              ? dayjs().add(1, 'day')
              : undefined
          }
          maxDate={fields.status !== Status.UPCOMING ? dayjs() : undefined}
          onChange={(value, context) => {
            handleDateChange('startDate', value);
          }}
          slotProps={{
            field: {
              clearable: true,
              onClear: () => {
                clearDate('startDate');
              }
            },
            textField: {
              error: !!errors.startDate,
              helperText: errors.startDate
            }
          }}
        />
        <DatePicker
          label="End Date"
          value={fields.endDate ? dayjs(fields.endDate, dateFormat) : null}
          minDate={endDateMin()}
          maxDate={fields.status === Status.FINISHED ? dayjs() : undefined}
          onChange={(value, context) => {
            handleDateChange('endDate', value);
          }}
          slotProps={{
            field: {
              clearable: true,
              onClear: () => {
                clearDate('endDate');
              }
            },
            textField: {
              error: !!errors.endDate,
              helperText: errors.endDate
            }
          }}
        />
      </div>
      <div className={animeFormStyles.fieldsContainer}>
        <TextField
          required
          className={animeFormStyles.urlInput}
          id="poster-image-url-input"
          label="Poster Image URL"
          name="posterImage"
          type="url"
          value={fields.posterImage ?? ''}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={!!errors.posterImage}
          helperText={errors.posterImage}
        />
        <TextField
          className={animeFormStyles.urlInput}
          id="cover-image-url-input"
          label="Cover Image URL"
          name="coverImage"
          type="url"
          error={!!errors.coverImage}
          helperText={errors.coverImage}
          value={fields.coverImage ?? ''}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
        />
      </div>
      <div className={animeFormStyles.categoriesContainer}>
        <label
          htmlFor="categories-container"
          className={
            !!errors.categories
              ? animeFormStyles.alertColor
              : animeFormStyles.inputColor
          }
        >
          Categories*:
        </label>
        {!!errors.categories?.general && (
          <span className={animeFormStyles.alertMessage}>
            {errors.categories.general}
          </span>
        )}
        {fields.categories.length > 0 && (
          <div className={animeFormStyles.categories}>
            {fields.categories.map((category, index) => {
              return (
                <div
                  id="category-container"
                  key={index}
                  className={animeFormStyles.category}
                >
                  <TextField
                    id={`category-input-${index}`}
                    name="categories"
                    placeholder="New Category"
                    value={category}
                    error={
                      !!errors.categories &&
                      typeof errors.categories === 'object' &&
                      !!errors.categories[index]
                    }
                    helperText={
                      !!errors.categories &&
                      typeof errors.categories === 'object' &&
                      errors.categories[index]
                    }
                    onChange={(event) => {
                      handleCategoryChange(index, event);
                    }}
                    onBlur={(event) => {
                      handleTextFieldBlur(event, index);
                    }}
                  />
                  <IconButton
                    aria-label="remove a category"
                    id={`remove-catogery-button-${index}`}
                    size="small"
                    color="error"
                    onClick={(event) => {
                      removeCategory(index);
                    }}
                  >
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
        <IconButton
          aria-label="add a new category"
          color="success"
          size="small"
          onClick={(event) => {
            addEmptyCategory();
          }}
        >
          <AddCircleOutlineIcon fontSize="medium" />
        </IconButton>
      </div>
      <div className={animeFormStyles.fieldsContainer}>
        <TextField
          required
          id="description-input"
          label="Description"
          name="description"
          error={!!errors.description}
          fullWidth
          multiline
          rows={7}
          value={fields.description ?? ''}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          helperText={errors.description}
        />
      </div>
      <div className={animeFormStyles.submitBtnContainer}>
        <Button type="submit" variant="outlined" size="large">
          Submit
        </Button>
        {!!Object.keys(errors).length && (
          <span className={animeFormStyles.alertMessage}>
            {FORM_VALIDATION_ERROR_MESSAGE}
          </span>
        )}
      </div>
    </form>
  );
}
