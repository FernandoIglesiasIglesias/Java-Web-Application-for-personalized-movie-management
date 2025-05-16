import PropTypes from 'prop-types';
import './Common.css'

const Errors = ({divId, errors, onClose}) => {
    if(!errors){
        return null;
    }

    let globalError;
    let fieldErrors;

    if (errors.globalError) {
        globalError = errors.globalError;
    } else if (errors.fieldErrors) {
        fieldErrors = [];
        errors.fieldErrors.forEach(e => {
            let fieldName = e.fieldName;
            fieldErrors.push(`${fieldName}: ${e.message}`);
        });

    }

    return (
        <div id={divId} className="alert alert-danger alert-dismissible fade show" role="alert">
            {globalError ? globalError : ''}

            {fieldErrors ?
                <ul>
                    {fieldErrors.map((fieldError, index) =>
                        <li key={index}>{fieldError}</li>
                    )}
                </ul>
                : 
                ''
            }

            <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => onClose()}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
}

Errors.propTypes = {
    errors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onClose: PropTypes.func.isRequired
};

export default Errors;