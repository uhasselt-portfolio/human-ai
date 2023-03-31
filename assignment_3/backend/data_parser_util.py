import json
import pandas as pd

class DataParserUtil:
    _data: pd.DataFrame = None
    _codes: dict = None

    # write a constructor
    def __init__(self):
        pass

    def get_data(self):
        if self._data is None:
            return {}
        
        self._data = self._data.drop(self._data[self._data.detail_age == 999].index)

        return self._data.count().to_string()

    def load_data(self, file_name: str = '2015_data.csv'):
        self._data = pd.read_csv(file_name, low_memory=False)
        self._data = self._data.drop(self._data[self._data.detail_age == 999].index)

    def apply_filters(self, filters: dict):
        death_data_persona = self._data[self._data.detail_age_type == 1]

        death_data_persona = self._data.drop(self._data[self._data.detail_age != filters['age']].index)
        print(f"After filtering age: {len(death_data_persona.index)}")

        death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.resident_status != int(filters['resident'])].index)
        print(f"After filtering resident status: {len(death_data_persona.index)}")

        death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.sex != filters['sex']].index)
        print(f"After filtering sex: {len(death_data_persona.index)}")

        death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.marital_status != filters['marital_status']].index)
        print(f"After filtering marital status: {len(death_data_persona.index)}")

        death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.race != int(filters['race'])].index)
        print(f"After filtering race: {len(death_data_persona.index)}")

        death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.education_2003_revision != int(filters['education'])].index)
        print(f"After filtering education: {len(death_data_persona.index)}")

        if "-" not in filters['hispanic_origin']:
            death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.hispanic_origin != filters['hispanic_origin']].index)

        else:
            lower_range, upper_range = int(filters['hispanic_origin'].split("-")[0]), int(filters['hispanic_origin'].split("-")[1])

            death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.hispanic_origin < lower_range].index)
            death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona.hispanic_origin > upper_range].index)

        print(f"After filtering hispanic origin: {len(death_data_persona.index)}")

        if filters['drugs'] == "no":
            death_data_persona = death_data_persona.drop(death_data_persona[death_data_persona["358_cause_recode"].isin([425, 443])].index)
            print(f"After filtering non-drug use: {len(death_data_persona.index)}")

        return death_data_persona

    def get_options(self):
        if self._codes is not None:
            return self._codes
        
        with open("2015-codes.json") as json_file:
            self._codes = json.load(json_file)

        codes = {}

        codes['max_age'] = {'value': str(self._data['detail_age'].max())}
        codes['resident'] = self._codes['resident_status']
        codes['sex'] = self._codes['sex'] 
        codes['marital_status'] = self._codes['marital_status']
        codes['race'] = self._codes['race']
        codes['education'] = self._codes['education_2003_revision']
        codes['hispanic_origin'] = self._codes['hispanic_origin']
        codes['cause_of_death'] = self._codes['39_cause_recode']

        codes['cause_of_death'] = sorted(codes['cause_of_death'], key=lambda k: k['id'])

        self._codes = codes

        return self._codes
    
    def get_probabilities(self, df: pd.DataFrame):
        group = df.groupby(['39_cause_recode'])['39_cause_recode'].count()

        # Get array value
        group_dict = group.to_dict()

        # causes_by_index = [keys[x if len(str(x)) == 3 else f"0{x}" if len(str(x)) == 2 else f"00{x}"] for x in group_dict.keys()]
        causes_by_index = [x for x in group_dict.keys()]
        number_of_deaths = [x for x in group_dict.values()]

        total = sum(number_of_deaths)

        result = [{'total': round(number_of_deaths[idx]/total, 3), 'id': str(causes_by_index[idx])} for idx in range(len(number_of_deaths))]

        return result