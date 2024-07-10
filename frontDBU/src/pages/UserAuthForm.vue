<template>
  <span class="p-0 m-0">
    <table>
      <tr>
        <td>User:</td>
        <td>
          <input
            v-model="userInfo.user_ID"
            required
            title="user, admin or operator"
            size="30"
          >
        </td>
      </tr>

      <tr>
        <td>Email:</td>
        <td>
          <input v-model="userInfo.email" label="Email" required size="30">
        </td>
      </tr>

      <tr>
        <td>Password:</td>
        <td>
          <input
            v-model="userInfo.password"
            :type="showPassword ? 'text' : 'password'"
            required
            size="30"
          >
        </td>
      </tr>
      <tr>
        <td>
          <button
            class="default"
            @click.stop="submitForm(userInfo)"
            :disabled="!valid"
          >
            {{ buttonText }}
          </button>
        </td>
      </tr>
    </table>
  </span>
</template>

<script>
//import validations from "@/utils/validations";

export default {
  props: ["submitForm", "buttonText", "hasName"],
  data() {
    return {
      valid: true,
      showPassword: false,
      options: [
        { value: "ADY", text: "Adyen Australia (has quarterly) (ADY)" },
        { value: "ANZ", text: "ANZ Australia" },
        { value: "AMP", text: "AMP Australia (has yearly)" },
        { value: "BAE", text: "Bank of Us (BAE)" },
        { value: "CBA", text: "CommBank (CBA)" },
        { value: "CFC", text: "Community First (CFC)" },
        { value: "CRU", text: "Cuscal (CRU)" },
        { value: "ASL", text: "Australian Settlements (ASL)" },
        { value: "MEB", text: "Members Equity (MEB)" },
        { value: "NEW", text: "Newcastel Perm (NEW)" },
        { value: "RBA", text: "Reserve Bank (RBA)" },
        { value: "WBC", text: "Westpac (WBC)" },
        { value: "-", text: "None" },
      ],
      SubGroups: [
        { text: "CS1", value: "CS1" },
        { text: "CS2", value: "CS2" },
        { text: "IAC", value: "IAC" },
        { text: "HVC", value: "HVC" },
        { text: "NPP", value: "NPP" },
        { text: "APN", value: "APN" },
      ],
      userInfo: {
        user_ID: "admin",
        FI: null,
        SubGroup: "CS1",
        SubGroup1: "CS2",
        email: "person@fred.com",
        password: "ndje75nd6398nf645",
      },
      //    ...validations,
    };
  },
};
</script>
