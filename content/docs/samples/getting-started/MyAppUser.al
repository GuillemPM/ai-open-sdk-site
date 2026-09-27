permissionset 50100 "MYAPP AI User"
{
    Assignable = true;
    Caption = 'My App - AI User';
    IncludedPermissionSets =
        "AIOS Objects",             // core client, schema, tools
        "AIOS Anthropic Objects",   // the provider you call
        "MYAPP Objects";            // your own objects
}
