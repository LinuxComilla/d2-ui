import React from 'react';

import CircularProgress from 'material-ui/lib/circular-progress';
import TextField from 'material-ui/lib/text-field';

import Translate from '../i18n/Translate.mixin';
import LocaleSelector from '../i18n/LocaleSelector.component';

import actions from './translationForm.actions';
import store from './translation.store';


export default React.createClass({
    propTypes: {
        onTranslationSaved: React.PropTypes.func.isRequired,
        onTranslationError: React.PropTypes.func.isRequired,
        objectTypeToTranslate: React.PropTypes.object.isRequired,
        objectToTranslate: React.PropTypes.shape({
            id: React.PropTypes.string.isRequired,
        }).isRequired,
    },

    mixins: [Translate],

    getInitialState() {
        return {
            loading: true,
            translations: {},
            translationValues: {},
            currentSelectedLocale: '',
        };
    },

    componentDidMount() {
        actions.loadLocales();

        this.disposable = store.subscribe((storeState) => {
            this.setState({
                ...storeState,
                translationValues: (storeState.translations || [])
                    .reduce((acc, translation) => {
                        acc[translation.property] = translation.value;
                        return acc;
                    }, {}),
                loading: false,
            });
        });
    },

    componentWillUnmount() {
        this.disposable && this.disposable.dispose && this.disposable.dispose();
    },

    getLoadingdataElement() {
        return (
            <div style={{textAlign: 'center'}}>
                <CircularProgress mode="indeterminate"/>
            </div>
        );
    },

    renderForm() {
        return (
            <div>
                <div>
                    <TextField floatingLabelText={this.getTranslation('name')}
                               value={this.state.translationValues.name}
                               fullWidth
                               onChange={this._setValue.bind(this, 'name')}
                               onBlur={this._saveValue.bind(this, 'name')}
                    />
                    <div>{this.props.objectToTranslate.name}</div>
                </div>
                <div>
                    <TextField floatingLabelText={this.getTranslation('short_name')}
                               value={this.state.translationValues.shortName}
                               fullWidth
                               onChange={this._setValue.bind(this, 'shortName')}
                               onBlur={this._saveValue.bind(this, 'shortName')}
                    />
                    <div>{this.props.objectToTranslate.shortName}</div>
                </div>
                <div>
                    <TextField floatingLabelText={this.getTranslation('description')}
                               value={this.state.translationValues.description}
                               fullWidth
                               onChange={this._setValue.bind(this, 'description')}
                               onBlur={this._saveValue.bind(this, 'description')}
                    />
                    <div>{this.props.objectToTranslate.description}</div>
                </div>
                {this.renderAdditionalTranslationFields()}
            </div>
        );
    },

    renderHelpText() {
        return (
            <div>
                <p>{this.getTranslation('select_a_locale_to_enter_translations_for_that_language')}</p>
            </div>
        );
    },

    renderAdditionalTranslationFields() {
        if (this.props.objectTypeToTranslate.name === this.context.d2.models.dataElement.name) {
            return (
                <div>
                    <TextField floatingLabelText={this.getTranslation('form_name')}
                               value={this.state.translationValues.formName}
                               fullWidth
                               onChange={this._setValue.bind(this, 'formName')}
                               onBlur={this._saveValue.bind(this, 'formName')}
                    />
                    <div>{this.props.objectToTranslate.formName}</div>
                </div>
            );
        }
    },

    render() {
        if (this.state.loading) {
            return this.getLoadingdataElement();
        }

        return (
            <div style={{minHeight: 250}}>
                <LocaleSelector locales={this.state.availableLocales} onChange={this._reloadTranslations} />
                {Boolean(this.state.currentSelectedLocale) ? this.renderForm() : this.renderHelpText()}
            </div>
        );
    },

    _reloadTranslations(locale) {
        actions.loadTranslationsForObject(this.props.objectToTranslate.id, locale);
        this.setState({
            currentSelectedLocale: locale,
        });
    },

    _setValue(property, event) {
        const newTranslations = this.state.translationValues;

        newTranslations[property] = event.target.value;

        this.setState({
            translationValues: newTranslations,
        });
    },

    _saveValue(property, event) {
        actions.saveTranslation(property, event.target.value, this.props.objectToTranslate.id, this.props.objectTypeToTranslate, this.state.currentSelectedLocale)
            .subscribe(this.props.onTranslationSaved, this.props.onTranslationError);
    },
});
