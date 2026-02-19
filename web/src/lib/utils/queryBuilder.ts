import { Rule, RuleGroup, Token } from "@/components/search/query-editor";
import { tokenTypes } from "@/components/search/search-bar";
import { RuleType, RuleGroupType } from "react-querybuilder";

export interface Data {
  api_endpoint: string;
  component_name: string;
  field_label: string;
  field_name: string;
  field_type: string;
  filter_type: string;
  is_dynamic: boolean;
  master_connector_source_id: string;
  onload_render: boolean;
  operators: string[];
};

export interface SearchFields {
  counts?: number;
  error?: boolean;
  message?: string;
  data: Array<Data> | null;
};

export const convertBuilderQueryToTokens = (builderQuery: RuleType<string, string, any, string> | RuleGroupType<RuleType<string, string, any, string>, string>, searchFields: SearchFields | null) => {
  const tokens: any[] = [];
  const processRules = (rules: any[], parentCombinator?: string) => {
    rules?.forEach((rule, index) => {
      if (rule?.rules) {
        tokens.push({ type: tokenTypes.GROUP_START, value: '(', label: '(' });
        processRules(rule?.rules, rule?.combinator);
        tokens.push({ type: tokenTypes.GROUP_END, value: ')', label: ')' });
      } else if (rule?.field) {
        const fieldType = searchFields?.data?.find((f: Data) => f.field_name === rule?.field)?.field_type;
        tokens.push({ type: tokenTypes.FIELD, value: rule?.field, field_type: fieldType, label: searchFields?.data?.find((f: Data) => f.field_name === rule?.field)?.field_label });
        tokens.push({ type: tokenTypes.OPERATOR, value: rule?.operator, label: rule?.operator });
        
        let value = typeof rule?.value === 'string' && fieldType !== 'bool' 
          ? rule?.value
          : rule?.value?.toString();
        
        const dateTypeFields = searchFields?.data?.filter((f: Data) => f.field_type === 'date').map((f: Data) => f.field_name) ;
        if (dateTypeFields?.includes(rule?.field)) {
          const datePattern = /^\s*(\d{4})\s*[\-\/\.]\s*(\d{2})\s*[\-\/\.]\s*(\d{2})\s*$/;
          const dateMatch = value.match(datePattern);
          if (dateMatch) {
            value = value.replace(/\s+/g, '');
            
            const year = dateMatch[1];
            const month = dateMatch[2];
            const day = dateMatch[3];
            value = `${month}-${day}-${year}`;
          }
        }
        
        tokens.push({ type: tokenTypes.VALUE, value, field_type: fieldType, label: value });
      }
      if (index < rules.length - 1 && parentCombinator) {
        tokens.push({ type: tokenTypes.COMBINATOR, value: parentCombinator.toUpperCase(), label: parentCombinator.toUpperCase() });
      }
    });
  };
  
  if ('rules' in builderQuery && searchFields) {
    processRules(builderQuery.rules, builderQuery.combinator);
  }
  return tokens;
};

interface CurrentTokens {
  type: string;
  value: string;
  field_type?: string
};

export const convertTokensToBuilderQuery = (currentTokens: CurrentTokens[]) => {
  const query: any = {
    combinator: 'and',
    rules: [],
  };

  let currentRule: any = {};
  let groupStack: any[] = [];
  let currentGroup: any[] = query.rules;

  currentTokens.forEach((token) => {
    switch (token.type) {
      case tokenTypes.FIELD:
        currentRule = { field: token.value };
        if (groupStack.length === 0) {
          currentGroup.push(currentRule);
        } else {
          groupStack[groupStack.length - 1].rules.push(currentRule);
        }
        break;

      case tokenTypes.OPERATOR:
        if (currentRule.field) {
          currentRule.operator = token.value;
        }
        break;

      case tokenTypes.VALUE:
        if (currentRule.field && currentRule.operator) {
          currentRule.value = token.value.replace(/^["'](.+)["']$/, '$1');
          currentRule = {};
        }
        break;

      case tokenTypes.COMBINATOR:
        if (groupStack.length === 0) {
          query.combinator = token.value.toLowerCase();
        } else {
          groupStack[groupStack.length - 1].combinator = token.value.toLowerCase();
        }
        break;

      case tokenTypes.GROUP_START:
        const newGroup = { combinator: 'and', rules: [] };
        groupStack.push(newGroup);
        if (groupStack.length === 1) {
          currentGroup.push(newGroup);
        } else {
          groupStack[groupStack.length - 2].rules.push(newGroup);
        }
        break;

      case tokenTypes.GROUP_END:
        groupStack.pop();
        break;
    }
  });
  return query;
};

export const parseQueryToJson = (tokens: Token[], searchFields: SearchFields | null): RuleGroup => {

  const parseGroup = (tokens: Token[], startIndex = 0): [RuleGroup, number] => {

    let currentIndex = startIndex;
    const rules: (Rule | RuleGroup)[] = [];
    let currentRule: Partial<Rule> = {};
    let currentCombinator = 'and';
    
    while (currentIndex < tokens.length) {
      const token = tokens[currentIndex];
      const tokenType = token.selectedType || token.type;
      const tokenText = token.name || token.value;
      
      if (tokenText === '(') {
        const [groupRules, newIndex] = parseGroup(tokens, currentIndex + 1);
        rules.push(groupRules);
        currentIndex = newIndex;
        continue;
      }
      
      if (tokenText === ')') {
        return [{
          combinator: currentCombinator,
          rules: rules
        }, currentIndex];
      }
      
      if (tokenType === 'combinator') {
        if (Object.keys(currentRule).length > 0) {
          rules.push(currentRule as Rule);
          currentRule = {};
        }
        currentCombinator = tokenText?.toLowerCase() || 'and';
        currentIndex++;
        continue;
      }
      
      if (tokenType === 'field') {
        currentRule.field = tokenText;
      } else if (tokenType === 'operator') {
        currentRule.operator = tokenText;
      } else if (tokenType === 'value') {
        let value = tokenText?.replace(/"/g, '').trim() || '';
        
        const dateTypeFields = searchFields?.data?.filter((f: Data) => f.field_type === 'date').map((f: Data) => f.field_name) ;
        if (dateTypeFields?.includes(currentRule?.field || '')) {
          const datePattern = /^\s*(\d{2})\s*[\-\/\.]\s*(\d{2})\s*[\-\/\.]\s*(\d{4})\s*$/;
          const dateMatch = value.match(datePattern);
          
          if (dateMatch) {
            value = value.replace(/\s+/g, '');
            
            const month = dateMatch[1];
            const day = dateMatch[2];
            const year = dateMatch[3];
            value = `${year}-${month}-${day}`;
          }
        }
        
        currentRule.value = value;
      }
      
      if (currentRule.field && currentRule.operator && currentRule.value !== undefined) {
        rules.push({...currentRule} as Rule);
        currentRule = {};
      }
      
      currentIndex++;
    }
    
    if (Object.keys(currentRule).length > 0 && currentRule.field && currentRule.operator && currentRule.value !== undefined) {
      rules.push(currentRule as Rule);
    }
    
    return [{
      combinator: currentCombinator,
      rules: rules
    }, currentIndex];
  };
  const [result] = parseGroup(tokens);
  return result;
};
