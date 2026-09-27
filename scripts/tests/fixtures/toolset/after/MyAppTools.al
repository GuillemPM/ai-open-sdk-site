codeunit 50101 "My App Tools" implements "AIOS Tool Handler"
{
    procedure GetDefinitions(): JsonArray
    var
        Schema: Codeunit "AIOS Schema";
        Definitions: JsonArray;
        Fields: List of [JsonObject];
    begin
        Fields.Add(Schema.Field('a', Schema.Number()));
        Fields.Add(Schema.Field('b', Schema.Number()));
        Definitions.Add(
            Schema.ToolDefinition(
                'add_numbers',
                'Adds two numbers (a and b) and returns the sum as text.',
                Schema.Object(Fields)));
        exit(Definitions);
    end;

    procedure Execute(Name: Text; Arguments: JsonObject; var ResultText: Text): Boolean
    begin
        case Name of
            'add_numbers':
                exit(AddNumbers(Arguments, ResultText));
            else begin
                ResultText := StrSubstNo('Unknown tool %1.', Name);
                exit(false);
            end;
        end;
    end;

    local procedure AddNumbers(Arguments: JsonObject; var ResultText: Text): Boolean
    var
        Token: JsonToken;
        A: Decimal;
        B: Decimal;
    begin
        if not Arguments.Get('a', Token) then begin
            ResultText := 'Missing required tool argument.';
            exit(false);
        end;
        A := Token.AsValue().AsDecimal();
        if not Arguments.Get('b', Token) then begin
            ResultText := 'Missing required tool argument.';
            exit(false);
        end;
        B := Token.AsValue().AsDecimal();
        ResultText := Format(A + B);
        exit(true);
    end;
}
