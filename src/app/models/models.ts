import { ModelsAuth } from "./auth.models";
import { ModelsFirestore } from "./firestore.models";
import { ModelsFunctions } from "./functions.model";

export namespace Models {
    export import Auth = ModelsAuth;
    export import Firestore = ModelsFirestore;
    export import Functions = ModelsFunctions;
}